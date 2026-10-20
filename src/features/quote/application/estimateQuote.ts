import type { GeometryMetrics } from '../domain/geometry';
import type { QuoteDecision } from '../domain/quoteDecision';
import type { QuoteOptions } from '../domain/quoteOptions';
import type { QuoteEstimator } from './ports';

export const estimateQuote = (
  estimator: QuoteEstimator,
  metrics: GeometryMetrics,
  options: QuoteOptions,
): Promise<QuoteDecision> => estimator.estimate({ metrics, options });
