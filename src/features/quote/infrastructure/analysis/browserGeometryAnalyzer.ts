import type { BufferGeometry } from 'three';
import type { GeometryAnalyzer } from '../../application/ports';

/**
 * Runs the analysis on the main thread (loaded lazily with three-mesh-bvh).
 * A Web Worker or a slicer-backed adapter can implement the same port.
 */
export const browserGeometryAnalyzer: GeometryAnalyzer<BufferGeometry> = {
  analyze: async (geometry, { overhangAngleDeg }) => {
    const { analyzeGeometry } = await import('./analyzeGeometry');
    return analyzeGeometry(geometry, { overhangAngleDeg });
  },
};
