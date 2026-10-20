import {
  ManualQuoteSubmissionError,
  type ManualQuoteGateway,
  type ManualQuoteReceipt,
  type ManualQuoteRequest,
} from '../../application/ports';

/**
 * Multipart payload contract (POST, multipart/form-data):
 *   file           binary  the uploaded model, original file name
 *   name           string  required
 *   email          string  required
 *   phone          string  required
 *   notes          string  optional (may be empty)
 *   options        JSON    { materialId, colorId, infillPercent, layerHeightId }
 *   metrics        JSON    GeometryMetrics (mm, mm², mm³)
 *   triageStatus   string  "REVIEW"
 *   triageReasons  JSON    [{ code, measured, limit }]
 *   evaluatedAt    string  ISO-8601 time of the triage decision
 */
export const buildManualQuoteFormData = (request: ManualQuoteRequest): FormData => {
  const form = new FormData();
  form.append('file', request.file, request.file.name);
  form.append('name', request.contact.name);
  form.append('email', request.contact.email);
  form.append('phone', request.contact.phone);
  form.append('notes', request.contact.notes);
  form.append('options', JSON.stringify(request.options));
  form.append('metrics', JSON.stringify(request.metrics));
  form.append('triageStatus', request.triage.status);
  form.append('triageReasons', JSON.stringify(request.triage.reasons));
  form.append('evaluatedAt', request.triage.evaluatedAt);
  return form;
};

export interface HttpGatewayOptions {
  readonly endpoint: string;
  readonly timeoutMs?: number;
  readonly fetchFn?: (url: string, init?: RequestInit) => Promise<Response>;
}

const readReceipt = async (response: Response): Promise<ManualQuoteReceipt> => {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'referenceId' in body && typeof body.referenceId === 'string') {
      return { referenceId: body.referenceId };
    }
  } catch {
    // Empty or non-JSON success body: still a success.
  }
  return {};
};

export const createHttpManualQuoteGateway = ({
  endpoint,
  timeoutMs = 20_000,
  fetchFn = (url, init) => fetch(url, init),
}: HttpGatewayOptions): ManualQuoteGateway => ({
  submit: async (request) => {
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
    try {
      // Do not set Content-Type: the browser adds the multipart boundary.
      const response = await fetchFn(endpoint, {
        method: 'POST',
        body: buildManualQuoteFormData(request),
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) throw new ManualQuoteSubmissionError('HTTP', response.status);
      return await readReceipt(response);
    } catch (error) {
      if (error instanceof ManualQuoteSubmissionError) throw error;
      throw new ManualQuoteSubmissionError(timedOut ? 'TIMEOUT' : 'NETWORK');
    } finally {
      clearTimeout(timer);
    }
  },
});
