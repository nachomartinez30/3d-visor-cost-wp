import { describe, expect, it } from 'vitest';
import { BufferAttribute, BufferGeometry } from 'three';
import { analyzeGeometry } from '../analysis/analyzeGeometry';
import { box, merge } from './shapes';

describe('analyzeGeometry', () => {
  it('measures a 20 mm cube', () => {
    const metrics = analyzeGeometry(box([0, 0, 0], [20, 20, 20]));
    expect(metrics.volumeMm3).toBeCloseTo(8000, 3);
    expect(metrics.surfaceAreaMm2).toBeCloseTo(2400, 3);
    expect(metrics.dimensionsMm).toEqual({ x: 20, y: 20, z: 20 });
    expect(metrics.triangleCount).toBe(12);
    expect(metrics.openEdgeCount).toBe(0);
  });

  it('does not count the face resting on the plate as overhang', () => {
    const metrics = analyzeGeometry(box([0, 0, 0], [20, 20, 20]));
    expect(metrics.overhangAreaMm2).toBe(0);
    expect(metrics.overhangAreaRatio).toBe(0);
    expect(metrics.islandCount).toBe(0);
  });

  it('detects a box floating above a base as an island', () => {
    const base = box([0, 0, 0], [40, 40, 5]);
    const floating = box([10, 10, 20], [30, 30, 30]);
    const metrics = analyzeGeometry(merge(base, floating));
    expect(metrics.islandCount).toBe(1);
  });

  it('does not treat a shell resting on another shell as an island', () => {
    const base = box([0, 0, 0], [40, 40, 5]);
    const stacked = box([10, 10, 5], [30, 30, 15]);
    expect(analyzeGeometry(merge(base, stacked)).islandCount).toBe(0);
  });

  it('measures overhangs of a T-shape and their unsupported area', () => {
    const stem = box([-5, -5, 0], [5, 5, 30]);
    const bar = box([-20, -5, 30], [20, 5, 40]);
    const metrics = analyzeGeometry(merge(stem, bar));
    // Arms underside: (40 - 10) * 10 = 300 mm² hanging over empty space.
    expect(metrics.overhangAreaRatio).toBeGreaterThan(0);
    // Sampling-based estimate: allow 5 % error.
    expect(metrics.overhangAreaMm2).toBeGreaterThan(285);
    expect(metrics.overhangAreaMm2).toBeLessThan(315);
    expect(metrics.unsupportedOverhangAreaMm2).toBeGreaterThan(285);
    expect(metrics.unsupportedOverhangAreaMm2).toBeLessThan(315);
    expect(metrics.islandCount).toBe(0);
  });

  it('respects a custom overhang angle', () => {
    // A down-facing face tilted 45° from vertical (normal z ≈ -0.707):
    // not an overhang with a 70° limit, but an overhang with a 20° limit.
    const geometry = new BufferGeometry();
    const vertices = new Float32Array([0, 0, 10, 0, 10, 0, 10, 0, 10]);
    geometry.setAttribute('position', new BufferAttribute(vertices, 3));
    const loose = analyzeGeometry(geometry, { overhangAngleDeg: 70 });
    const strict = analyzeGeometry(geometry, { overhangAngleDeg: 20 });
    expect(loose.overhangAreaMm2).toBe(0);
    expect(strict.overhangAreaMm2).toBeGreaterThan(0);
  });

  it('counts open edges of a non-watertight mesh', () => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3));
    expect(analyzeGeometry(geometry).openEdgeCount).toBe(3);
  });
});

describe('analyzeGeometry with inverted winding', () => {
  it('still finds overhangs when all faces point inwards', () => {
    const stem = box([-5, -5, 0], [5, 5, 30]);
    const bar = box([-20, -5, 30], [20, 5, 40]);
    const geometry = merge(stem, bar);
    const positions = geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i += 3) {
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
      positions.setXYZ(i, positions.getX(i + 1), positions.getY(i + 1), positions.getZ(i + 1));
      positions.setXYZ(i + 1, x, y, z);
    }
    const metrics = analyzeGeometry(geometry);
    expect(metrics.volumeMm3).toBeGreaterThan(0);
    expect(metrics.overhangAreaMm2).toBeGreaterThan(285);
  });
});
