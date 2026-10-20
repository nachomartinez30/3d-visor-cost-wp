import { describe, expect, it } from 'vitest';
import { decideQuote } from '../quoteDecision';
import { cube50, standardOptions, testConfig, withMetrics } from './fixtures';

const now = new Date('2026-01-01T00:00:00.000Z');

describe('decideQuote', () => {
  it('returns an automatic price for a clean part', () => {
    const decision = decideQuote({ metrics: cube50, options: standardOptions, config: testConfig, now });
    expect(decision.status).toBe('AUTO');
    if (decision.status === 'AUTO') expect(decision.estimate.total).toBeGreaterThan(0);
  });

  it('never exposes a price when supports or islands are detected', () => {
    for (const metrics of [withMetrics({ islandCount: 1 }), withMetrics({ overhangAreaRatio: 0.3 })]) {
      const decision = decideQuote({ metrics, options: standardOptions, config: testConfig, now });
      expect(decision.status).toBe('REVIEW');
      expect(decision).not.toHaveProperty('estimate');
    }
  });

  it('records an audit trail with metrics, options, thresholds and time', () => {
    const decision = decideQuote({ metrics: withMetrics({ islandCount: 1 }), options: standardOptions, config: testConfig, now });
    expect(decision.audit).toEqual({
      evaluatedAt: '2026-01-01T00:00:00.000Z',
      metrics: withMetrics({ islandCount: 1 }),
      options: standardOptions,
      thresholds: testConfig.triage,
      reasons: decision.reasons,
    });
  });
});
