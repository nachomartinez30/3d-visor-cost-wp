import type { BufferGeometry } from 'three';

/** Centers the model on X/Y and places its lowest point on the build plate (z = 0). */
export const normalizeGeometry = (geometry: BufferGeometry): BufferGeometry => {
  geometry.computeBoundingBox();
  const bounds = geometry.boundingBox!;
  geometry.translate(
    -(bounds.min.x + bounds.max.x) / 2,
    -(bounds.min.y + bounds.max.y) / 2,
    -bounds.min.z,
  );
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
};
