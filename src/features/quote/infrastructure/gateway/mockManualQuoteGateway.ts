import type { ManualQuoteGateway } from '../../application/ports';
import { buildManualQuoteFormData } from './httpManualQuoteGateway';

/** Used when VITE_QUOTE_ENDPOINT is not set: waits, logs the payload and succeeds. */
export const createMockManualQuoteGateway = (delayMs = 1200): ManualQuoteGateway => ({
  submit: async (request) => {
    const form = buildManualQuoteFormData(request);
    const preview = Object.fromEntries(
      [...form.entries()].map(([key, value]) => [key, typeof value === 'string' ? value : `<file ${value.name}>`]),
    );
    console.info('[MockManualQuoteGateway] multipart payload', preview);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return { referenceId: `MOCK-${Date.now().toString(36).toUpperCase()}` };
  },
});
