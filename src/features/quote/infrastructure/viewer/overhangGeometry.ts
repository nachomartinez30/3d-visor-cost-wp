import { BufferAttribute, BufferGeometry } from 'three';

/** Builds a geometry with only the down-facing faces steeper than the angle (for highlighting). */
export const buildOverhangGeometry = (geometry: BufferGeometry, overhangAngleDeg: number): BufferGeometry => {
  const source = geometry.index ? geometry.toNonIndexed() : geometry;
  const positions = source.getAttribute('position');
  const limit = -Math.sin((overhangAngleDeg * Math.PI) / 180);
  const minZ = geometry.boundingBox?.min.z ?? 0;
  const out: number[] = [];
  for (let i = 0; i < positions.count; i += 3) {
    const ax = positions.getX(i), ay = positions.getY(i), az = positions.getZ(i);
    const bx = positions.getX(i + 1), by = positions.getY(i + 1), bz = positions.getZ(i + 1);
    const cx = positions.getX(i + 2), cy = positions.getY(i + 2), cz = positions.getZ(i + 2);
    const ux = bx - ax, uy = by - ay, uz = bz - az;
    const vx = cx - ax, vy = cy - ay, vz = cz - az;
    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;
    const length = Math.hypot(nx, ny, nz);
    if (length === 0 || nz / length >= limit) continue;
    if (Math.max(az, bz, cz) <= minZ + 1e-3) continue; // resting on the plate
    out.push(ax, ay, az, bx, by, bz, cx, cy, cz);
  }
  const result = new BufferGeometry();
  result.setAttribute('position', new BufferAttribute(new Float32Array(out), 3));
  result.computeVertexNormals();
  return result;
};
