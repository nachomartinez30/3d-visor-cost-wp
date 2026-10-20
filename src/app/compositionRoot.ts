import { quoteConfig } from '../features/quote/config/quote.mock';
import { browserGeometryAnalyzer } from '../features/quote/infrastructure/analysis/browserGeometryAnalyzer';
import { createLocalQuoteEstimator } from '../features/quote/infrastructure/estimation/localQuoteEstimator';
import { createManualQuoteGateway } from '../features/quote/infrastructure/gateway/createManualQuoteGateway';
import { threeModelLoader } from '../features/quote/infrastructure/loaders/threeModelLoader';
import type { QuoteDependencies } from '../features/quote/ui/QuoteDependencies';

/** Wires ports to adapters. Swap adapters here (e.g. a slicer-backed estimator). */
export const createQuoteDependencies = (): QuoteDependencies => ({
  config: quoteConfig,
  loader: threeModelLoader,
  analyzer: browserGeometryAnalyzer,
  estimator: createLocalQuoteEstimator(quoteConfig),
  gateway: createManualQuoteGateway(),
});
