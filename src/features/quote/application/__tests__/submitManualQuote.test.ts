import { describe, expect, it, vi } from 'vitest';
import { submitManualQuote } from '../submitManualQuote';
import { ManualQuoteSubmissionError, type ManualQuoteGateway } from '../ports';
import { decideQuote, type ReviewQuote } from '../../domain/quoteDecision';
import { standardOptions, testConfig, withMetrics } from '../../domain/__tests__/fixtures';

const review = decideQuote({
  metrics: withMetrics({ islandCount: 1 }),
  options: standardOptions,
  config: testConfig,
  now: new Date('2026-01-01T00:00:00Z'),
}) as ReviewQuote;

const contact = { name: 'Ada', email: 'ada@example.com', phone: '+1 555 123 4567', notes: '' };
const file = new File(['solid'], 'part.stl');

describe('submitManualQuote', () => {
  it('validates the contact before calling the gateway', async () => {
    const gateway: ManualQuoteGateway = { submit: vi.fn() };
    const result = await submitManualQuote({ file, contact: { ...contact, email: 'x' }, decision: review }, gateway);
    expect(result).toEqual({ ok: false, reason: 'INVALID', errors: { email: 'INVALID_EMAIL' } });
    expect(gateway.submit).not.toHaveBeenCalled();
  });

  it('sends file, trimmed contact, options, metrics and triage reasons', async () => {
    const gateway: ManualQuoteGateway = { submit: vi.fn(async () => ({ referenceId: 'Q-1' })) };
    const result = await submitManualQuote({ file, contact: { ...contact, name: ' Ada ' }, decision: review }, gateway);
    expect(result).toEqual({ ok: true, receipt: { referenceId: 'Q-1' } });
    expect(gateway.submit).toHaveBeenCalledWith({
      file,
      contact,
      options: standardOptions,
      metrics: review.audit.metrics,
      triage: { status: 'REVIEW', reasons: review.reasons, evaluatedAt: review.audit.evaluatedAt },
    });
  });

  it('maps gateway failures to a FAILED result', async () => {
    const gateway: ManualQuoteGateway = {
      submit: async () => Promise.reject(new ManualQuoteSubmissionError('TIMEOUT')),
    };
    const result = await submitManualQuote({ file, contact, decision: review }, gateway);
    expect(result).toEqual({ ok: false, reason: 'FAILED', failure: 'TIMEOUT' });
  });

  it('treats unknown errors as network failures', async () => {
    const gateway: ManualQuoteGateway = { submit: async () => Promise.reject(new TypeError('offline')) };
    const result = await submitManualQuote({ file, contact, decision: review }, gateway);
    expect(result).toEqual({ ok: false, reason: 'FAILED', failure: 'NETWORK' });
  });
});
