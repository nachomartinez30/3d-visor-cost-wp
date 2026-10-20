import { describe, expect, it } from 'vitest';
import { evaluateTriage } from '../triage';
import { cube50, testConfig, withMetrics } from './fixtures';

const cheap = { total: 20, printTimeHours: 1 };
const codes = (metrics = cube50, estimate = cheap) =>
  evaluateTriage(metrics, estimate, testConfig.triage).reasons.map((r) => r.code);

describe('evaluateTriage', () => {
  it('auto-quotes a simple, printable part', () => {
    const result = evaluateTriage(cube50, cheap, testConfig.triage);
    expect(result.status).toBe('AUTO');
    expect(result.reasons).toEqual([]);
  });

  it('always sends floating islands to review', () => {
    const result = evaluateTriage(withMetrics({ islandCount: 1 }), cheap, testConfig.triage);
    expect(result.status).toBe('REVIEW');
    expect(result.reasons[0]).toEqual({ code: 'FLOATING_ISLANDS', measured: 1, limit: 0 });
  });

  it('sends islands to review even with permissive thresholds', () => {
    const permissive = { ...testConfig.triage, maxOverhangAreaRatio: 1, maxUnsupportedOverhangAreaMm2: 1e9 };
    expect(evaluateTriage(withMetrics({ islandCount: 2 }), cheap, permissive).status).toBe('REVIEW');
  });

  it('flags parts that need supports because of overhangs', () => {
    expect(codes(withMetrics({ overhangAreaRatio: 0.2, overhangAreaMm2: 3000 }))).toContain('SUPPORTS_REQUIRED');
  });

  it('accepts small overhangs under the threshold', () => {
    expect(codes(withMetrics({ overhangAreaRatio: 0.01, overhangAreaMm2: 50 }))).toEqual([]);
  });

  it('flags overhangs that hang over empty space', () => {
    expect(codes(withMetrics({ unsupportedOverhangAreaMm2: 500 }))).toContain('UNSUPPORTED_OVERHANG');
  });

  it('flags oversized parts on any axis', () => {
    expect(codes(withMetrics({ dimensionsMm: { x: 300, y: 50, z: 50 } }))).toContain('OVERSIZED');
    expect(codes(withMetrics({ dimensionsMm: { x: 50, y: 50, z: 221 } }))).toContain('OVERSIZED');
  });

  it('flags very small parts', () => {
    expect(codes(withMetrics({ dimensionsMm: { x: 1, y: 50, z: 50 } }))).toContain('TOO_SMALL');
  });

  it('flags high triangle counts as complex', () => {
    expect(codes(withMetrics({ triangleCount: 600_000 }))).toContain('HIGH_COMPLEXITY');
  });

  it('flags fine detail by surface-to-volume ratio', () => {
    expect(codes(withMetrics({ surfaceAreaMm2: 300_000 }))).toContain('FINE_DETAIL');
  });

  it('flags non-watertight meshes and invalid volumes', () => {
    expect(codes(withMetrics({ openEdgeCount: 4 }))).toContain('NON_MANIFOLD');
    expect(codes(withMetrics({ volumeMm3: 0 }))).toContain('INVALID_VOLUME');
  });

  it('flags expensive or long jobs', () => {
    expect(codes(cube50, { total: 900, printTimeHours: 1 })).toContain('HIGH_PRICE');
    expect(codes(cube50, { total: 20, printTimeHours: 60 })).toContain('LONG_PRINT');
  });

  it('keeps every triggered reason for auditing', () => {
    const reasons = codes(withMetrics({ islandCount: 1, overhangAreaRatio: 0.5, triangleCount: 1e6 }));
    expect(reasons).toEqual(['FLOATING_ISLANDS', 'SUPPORTS_REQUIRED', 'HIGH_COMPLEXITY']);
  });
});
