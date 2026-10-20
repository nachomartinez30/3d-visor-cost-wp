import { BufferGeometry, Mesh, type Object3D } from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type ModelFormat = 'stl' | 'obj' | '3mf';

/**
 * Parses raw file bytes into ONE non-indexed geometry with only a position attribute.
 * Units are assumed to be millimetres and Z is assumed to be "up" (STL/3MF convention).
 * Throws Error('NO_GEOMETRY') when nothing printable is found.
 */
export const parseModel = (format: ModelFormat, data: ArrayBuffer): BufferGeometry => {
  const geometry = format === 'stl' ? positionsOnly(new STLLoader().parse(data)) : flatten(parseScene(format, data));
  if (geometry.getAttribute('position').count < 3) throw new Error('NO_GEOMETRY');
  return geometry;
};

const parseScene = (format: 'obj' | '3mf', data: ArrayBuffer): Object3D =>
  format === 'obj' ? new OBJLoader().parse(new TextDecoder().decode(data)) : new ThreeMFLoader().parse(data);

const positionsOnly = (source: BufferGeometry): BufferGeometry => {
  const flat = source.index ? source.toNonIndexed() : source;
  const result = new BufferGeometry();
  result.setAttribute('position', flat.getAttribute('position').clone());
  return result;
};

/** Bakes world transforms of every mesh in the scene and merges them. */
const flatten = (root: Object3D): BufferGeometry => {
  root.updateMatrixWorld(true);
  const parts: BufferGeometry[] = [];
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const source = node.geometry as BufferGeometry;
    if (!source.getAttribute('position')) return;
    const part = positionsOnly(source);
    part.applyMatrix4(node.matrixWorld);
    parts.push(part);
  });
  if (parts.length === 0) throw new Error('NO_GEOMETRY');
  const merged = parts.length === 1 ? parts[0] : mergeGeometries(parts);
  if (!merged) throw new Error('NO_GEOMETRY');
  return merged;
};
