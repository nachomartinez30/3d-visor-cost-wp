import type { ManualQuoteGateway } from '../../application/ports';
import { createHttpManualQuoteGateway } from './httpManualQuoteGateway';
import { createMockManualQuoteGateway } from './mockManualQuoteGateway';

/** Picks the HTTP gateway when VITE_QUOTE_ENDPOINT is set, otherwise the mock. */
export const createManualQuoteGateway = (env: ImportMetaEnv = import.meta.env): ManualQuoteGateway => {
  const endpoint = env.VITE_QUOTE_ENDPOINT?.trim();
  if (!endpoint) return createMockManualQuoteGateway();
  const timeout = Number(env.VITE_QUOTE_TIMEOUT_MS);
  return createHttpManualQuoteGateway({ endpoint, timeoutMs: timeout > 0 ? timeout : undefined });
};
