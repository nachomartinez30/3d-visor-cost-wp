import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { analyzeGeometry } from '../analysis/analyzeGeometry';
import { normalizeGeometry } from '../loaders/normalizeGeometry';
import { parseModel } from '../loaders/parseModel';
import { evaluateTriage } from '../../domain/triage';
import { quoteConfig } from '../../config/quote.mock';

/** End-to-end on the sample files in public/samples: parse -> normalize -> analyze -> triage. */
const analyzeSample = (name: string) => {
  const bytes = readFileSync(resolve(process.cwd(), 'public/samples', name));
  const data = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const metrics = analyzeGeometry(normalizeGeometry(parseModel('stl', data)));
  return { metrics, triage: evaluateTriage(metrics, { total: 20, printTimeHours: 1 }, quoteConfig.triage) };
};

describe('sample STL pipeline', () => {
  it('auto-quotes the cube', () => {
    const { metrics, triage } = analyzeSample('cube-30mm.stl');
    expect(metrics.volumeMm3).toBeCloseTo(27_000, 0);
    expect(triage.status).toBe('AUTO');
  });

  it('sends the T-shape to review because of overhangs', () => {
    const { triage } = analyzeSample('t-shape-overhang.stl');
    expect(triage.reasons.map((r) => r.code)).toContain('SUPPORTS_REQUIRED');
  });

  it('sends the floating box to review because of an island', () => {
    const { metrics, triage } = analyzeSample('floating-island.stl');
    expect(metrics.islandCount).toBe(1);
    expect(triage.reasons[0]?.code).toBe('FLOATING_ISLANDS');
  });
});
