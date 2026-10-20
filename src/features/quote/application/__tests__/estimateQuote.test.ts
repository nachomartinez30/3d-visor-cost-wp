import { describe, expect, it } from 'vitest';
import { estimateQuote } from '../estimateQuote';
import { createLocalQuoteEstimator } from '../../infrastructure/estimation/localQuoteEstimator';
import { cube50, standardOptions, testConfig, withMetrics } from '../../domain/__tests__/fixtures';

const estimator = createLocalQuoteEstimator(testConfig, () => new Date('2026-01-01T00:00:00Z'));

describe('estimateQuote', () => {
  it('returns an AUTO decision with a price for a clean part', async () => {
    const decision = await estimateQuote(estimator, cube50, standardOptions);
    expect(decision.status).toBe('AUTO');
  });

  it('returns REVIEW without a price for a part with islands', async () => {
    const decision = await estimateQuote(estimator, withMetrics({ islandCount: 3 }), standardOptions);
    expect(decision.status).toBe('REVIEW');
    expect(decision).not.toHaveProperty('estimate');
  });
});
