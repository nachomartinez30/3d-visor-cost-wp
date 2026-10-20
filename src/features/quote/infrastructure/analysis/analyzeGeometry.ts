import { BufferAttribute, BufferGeometry, DoubleSide, Ray, Vector3 } from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MeshBVH } from 'three-mesh-bvh';
import type { GeometryMetrics } from '../../domain/geometry';

export interface AnalyzeOptions {
  /** Angle from vertical beyond which a down-facing face needs support. Default 45°. */
  readonly overhangAngleDeg?: number;
  /** Max downward rays cast for overhang/island checks (performance budget). */
  readonly rayBudget?: number;
}

const WELD_TOLERANCE_MM = 1e-4;
const CONTACT_TOLERANCE_MM = 0.05;
const MAX_SAMPLES_PER_TRIANGLE = 256;
const DEFAULT_RAY_BUDGET = 20_000;

interface Sample {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly area: number;
}

/**
 * Pure geometry analysis (no rendering). Z is the build direction.
 *
 * 1. Weld vertices by position, then compute volume (signed tetrahedra), area,
 *    bounding box, open edges and connected shells.
 * 2. Overhang candidates: down-facing triangles steeper than the angle that do not lie on the plate.
 * 3. Each candidate is sampled and a ray is cast straight down with a BVH:
 *    - hits another shell right below (touching)  -> internal contact, not an overhang
 *    - hits nothing                               -> overhang over empty space (support to plate)
 *    - hits the model further below               -> overhang supported on the model
 * 4. A shell is grounded if it touches the plate or touches a grounded shell below it.
 *    Shells that are not grounded are floating islands.
 */
export const analyzeGeometry = (input: BufferGeometry, options: AnalyzeOptions = {}): GeometryMetrics => {
  const overhangAngleDeg = options.overhangAngleDeg ?? 45;
  const rayBudget = options.rayBudget ?? DEFAULT_RAY_BUDGET;

  const geometry = weld(input);
  const positions = geometry.getAttribute('position') as BufferAttribute;
  const bvh = new MeshBVH(geometry);
  // The BVH may reorder the index; read it only after building.
  const index = geometry.getIndex();
  if (!index) throw new Error('Welded geometry must be indexed');
  const triangleCount = index.count / 3;

  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  const ab = new Vector3();
  const ac = new Vector3();
  const normal = new Vector3();

  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox!;
  const plateZ = bounds.min.z;
  const plateTolerance = Math.max(1e-3, (bounds.max.z - bounds.min.z) * 1e-4);
  const overhangNormalZ = -Math.sin((overhangAngleDeg * Math.PI) / 180);

  // Closed meshes with inverted winding have negative signed volume: flip their normals.
  // Open meshes have no reliable inside/outside, so their winding is trusted as-is.
  const openEdgeCount = countOpenEdges(index, positions.count);
  const volume = signedVolume(index, positions);
  const orientation = openEdgeCount === 0 && volume < 0 ? -1 : 1;
  const components = labelComponents(index, positions.count);
  const componentOfTriangle = new Int32Array(triangleCount);
  const componentMinZ = new Map<number, number>();
  const candidates: { triangle: number; area: number }[] = [];
  let surfaceArea = 0;
  let candidateArea = 0;

  for (let t = 0; t < triangleCount; t++) {
    const ia = index.getX(t * 3);
    const ib = index.getX(t * 3 + 1);
    const ic = index.getX(t * 3 + 2);
    a.fromBufferAttribute(positions, ia);
    b.fromBufferAttribute(positions, ib);
    c.fromBufferAttribute(positions, ic);

    normal.crossVectors(ab.subVectors(b, a), ac.subVectors(c, a));
    const doubleArea = normal.length();
    const area = doubleArea / 2;
    surfaceArea += area;

    const component = components[ia]!;
    componentOfTriangle[t] = component;
    const minZ = Math.min(a.z, b.z, c.z);
    componentMinZ.set(component, Math.min(componentMinZ.get(component) ?? Infinity, minZ));

    if (doubleArea === 0) continue;
    const nz = (orientation * normal.z) / doubleArea;
    const onPlate = Math.max(a.z, b.z, c.z) <= plateZ + plateTolerance;
    if (nz < overhangNormalZ && !onPlate) {
      candidates.push({ triangle: t, area });
      candidateArea += area;
    }
  }

  // Ray classification of overhang candidates.
  const ray = new Ray(new Vector3(), new Vector3(0, 0, -1));
  const restsOn = new Map<number, Set<number>>();
  let contactArea = 0;
  let unsupportedArea = 0;

  for (const candidate of candidates) {
    const own = candidate.triangle;
    const ownComponent = componentOfTriangle[own]!;
    const wanted = Math.round((rayBudget * candidate.area) / candidateArea);
    for (const sample of sampleTriangle(index, positions, own, candidate.area, wanted)) {
      ray.origin.set(sample.x, sample.y, sample.z + CONTACT_TOLERANCE_MM);
      let contact = false;
      let supported = false;
      for (const hit of bvh.raycast(ray, DoubleSide)) {
        const hitTriangle = hit.faceIndex ?? -1;
        if (hitTriangle === own) continue;
        const hitComponent = componentOfTriangle[hitTriangle] ?? -1;
        const touching = hit.distance <= CONTACT_TOLERANCE_MM * 2;
        if (touching && hitComponent === ownComponent) continue;
        if (touching) {
          contact = true;
          const below = restsOn.get(ownComponent) ?? new Set<number>();
          below.add(hitComponent);
          restsOn.set(ownComponent, below);
        } else {
          supported = true;
        }
      }
      if (contact) contactArea += sample.area;
      else if (!supported) unsupportedArea += sample.area;
    }
  }

  const islandCount = countFloatingComponents(componentMinZ, restsOn, plateZ + plateTolerance);
  const overhangArea = Math.max(0, candidateArea - contactArea);

  return {
    volumeMm3: Math.abs(volume),
    surfaceAreaMm2: surfaceArea,
    dimensionsMm: {
      x: round(bounds.max.x - bounds.min.x),
      y: round(bounds.max.y - bounds.min.y),
      z: round(bounds.max.z - bounds.min.z),
    },
    triangleCount,
    overhangAngleDeg,
    overhangAreaMm2: overhangArea,
    overhangAreaRatio: surfaceArea > 0 ? overhangArea / surfaceArea : 0,
    unsupportedOverhangAreaMm2: unsupportedArea,
    islandCount,
    openEdgeCount,
  };
};

/** Sum of signed tetrahedra (origin, a, b, c). Positive for outward-facing winding. */
const signedVolume = (index: BufferAttribute, positions: BufferAttribute): number => {
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  let volume = 0;
  for (let i = 0; i < index.count; i += 3) {
    a.fromBufferAttribute(positions, index.getX(i));
    b.fromBufferAttribute(positions, index.getX(i + 1));
    c.fromBufferAttribute(positions, index.getX(i + 2));
    volume += a.dot(b.cross(c)) / 6;
  }
  return volume;
};

const round = (value: number) => Math.round(value * 1e4) / 1e4;

const weld = (input: BufferGeometry): BufferGeometry => {
  const positionOnly = new BufferGeometry();
  positionOnly.setAttribute('position', input.getAttribute('position'));
  const source = input.getIndex();
  if (source) positionOnly.setIndex(source);
  return mergeVertices(positionOnly, WELD_TOLERANCE_MM);
};

/** Union-find over vertices connected by triangles; returns a root id per vertex. */
const labelComponents = (index: BufferAttribute, vertexCount: number): Int32Array => {
  const parent = new Int32Array(vertexCount);
  for (let i = 0; i < vertexCount; i++) parent[i] = i;
  const find = (v: number): number => {
    let root = v;
    while (parent[root] !== root) root = parent[root]!;
    while (parent[v] !== root) {
      const next = parent[v]!;
      parent[v] = root;
      v = next;
    }
    return root;
  };
  const union = (x: number, y: number) => {
    const rx = find(x);
    const ry = find(y);
    if (rx !== ry) parent[rx] = ry;
  };
  for (let i = 0; i < index.count; i += 3) {
    union(index.getX(i), index.getX(i + 1));
    union(index.getX(i), index.getX(i + 2));
  }
  for (let i = 0; i < vertexCount; i++) parent[i] = find(i);
  return parent;
};

const countOpenEdges = (index: BufferAttribute, vertexCount: number): number => {
  const uses = new Map<number, number>();
  const addEdge = (p: number, q: number) => {
    const key = Math.min(p, q) * vertexCount + Math.max(p, q);
    uses.set(key, (uses.get(key) ?? 0) + 1);
  };
  for (let i = 0; i < index.count; i += 3) {
    const p = index.getX(i);
    const q = index.getX(i + 1);
    const r = index.getX(i + 2);
    addEdge(p, q);
    addEdge(q, r);
    addEdge(r, p);
  }
  let open = 0;
  for (const count of uses.values()) if (count !== 2) open++;
  return open;
};

/** Stratified samples: centroids of an n×n barycentric subdivision. */
const sampleTriangle = (
  index: BufferAttribute,
  positions: BufferAttribute,
  triangle: number,
  area: number,
  wanted: number,
): Sample[] => {
  const n = Math.max(1, Math.ceil(Math.sqrt(Math.min(MAX_SAMPLES_PER_TRIANGLE, Math.max(1, wanted)))));
  const a = new Vector3().fromBufferAttribute(positions, index.getX(triangle * 3));
  const b = new Vector3().fromBufferAttribute(positions, index.getX(triangle * 3 + 1));
  const c = new Vector3().fromBufferAttribute(positions, index.getX(triangle * 3 + 2));
  const samples: Sample[] = [];
  const cellArea = area / (n * n);
  const push = (u: number, v: number) => {
    const w = 1 - u - v;
    samples.push({
      x: a.x * w + b.x * u + c.x * v,
      y: a.y * w + b.y * u + c.y * v,
      z: a.z * w + b.z * u + c.z * v,
      area: cellArea,
    });
  };
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i; j++) {
      push((i + 1 / 3) / n, (j + 1 / 3) / n); // upright cell
      if (j < n - i - 1) push((i + 2 / 3) / n, (j + 2 / 3) / n); // inverted cell
    }
  }
  return samples;
};

const countFloatingComponents = (
  componentMinZ: Map<number, number>,
  restsOn: Map<number, Set<number>>,
  plateLimit: number,
): number => {
  const grounded = new Set<number>();
  for (const [component, minZ] of componentMinZ) if (minZ <= plateLimit) grounded.add(component);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [component, below] of restsOn) {
      if (grounded.has(component)) continue;
      for (const other of below) {
        if (grounded.has(other)) {
          grounded.add(component);
          changed = true;
          break;
        }
      }
    }
  }
  return componentMinZ.size - grounded.size;
};
