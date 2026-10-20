import type { BufferGeometry } from 'three';
import type { GeometryAnalyzer, ManualQuoteGateway, ModelLoader, QuoteEstimator } from '../application/ports';
import type { QuoteConfig } from '../domain/quoteConfig';

/** Everything the quote UI needs, injected by the composition root (or by tests). */
export interface QuoteDependencies {
  readonly config: QuoteConfig;
  readonly loader: ModelLoader<BufferGeometry>;
  readonly analyzer: GeometryAnalyzer<BufferGeometry>;
  readonly estimator: QuoteEstimator;
  readonly gateway: ManualQuoteGateway;
}
