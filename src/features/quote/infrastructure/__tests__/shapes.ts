import { BoxGeometry, BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/** Axis-aligned box from min corner to max corner (mm), position attribute only. */
export const box = (min: [number, number, number], max: [number, number, number]): BufferGeometry => {
  const geometry = new BoxGeometry(max[0] - min[0], max[1] - min[1], max[2] - min[2]).toNonIndexed();
  geometry.deleteAttribute('normal');
  geometry.deleteAttribute('uv');
  geometry.translate((min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2);
  return geometry;
};

export const merge = (...parts: BufferGeometry[]): BufferGeometry => {
  const merged = mergeGeometries(parts);
  if (!merged) throw new Error('merge failed');
  return merged;
};
