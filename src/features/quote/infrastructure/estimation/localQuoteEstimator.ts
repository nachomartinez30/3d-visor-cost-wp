import { decideQuote } from '../../domain/quoteDecision';
import type { QuoteConfig } from '../../domain/quoteConfig';
import type { QuoteEstimator } from '../../application/ports';

/** In-browser estimator backed by the domain pricing engine and triage policy. */
export const createLocalQuoteEstimator = (config: QuoteConfig, clock: () => Date = () => new Date()): QuoteEstimator => ({
  estimate: async ({ metrics, options }) => decideQuote({ metrics, options, config, now: clock() }),
});
