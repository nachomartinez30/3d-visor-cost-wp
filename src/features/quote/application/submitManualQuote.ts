import { hasErrors, validateContact, type ContactDetails, type ContactErrors } from '../domain/contactValidation';
import type { ReviewQuote } from '../domain/quoteDecision';
import {
  ManualQuoteSubmissionError,
  type ManualQuoteGateway,
  type ManualQuoteReceipt,
  type SubmissionFailure,
} from './ports';

export interface SubmitManualQuoteInput {
  readonly file: File;
  readonly contact: ContactDetails;
  readonly decision: ReviewQuote;
}

export type SubmitManualQuoteResult =
  | { readonly ok: true; readonly receipt: ManualQuoteReceipt }
  | { readonly ok: false; readonly reason: 'INVALID'; readonly errors: ContactErrors }
  | { readonly ok: false; readonly reason: 'FAILED'; readonly failure: SubmissionFailure };

export const submitManualQuote = async (
  { file, contact, decision }: SubmitManualQuoteInput,
  gateway: ManualQuoteGateway,
): Promise<SubmitManualQuoteResult> => {
  const errors = validateContact(contact);
  if (hasErrors(errors)) return { ok: false, reason: 'INVALID', errors };
  try {
    const receipt = await gateway.submit({
      file,
      contact: {
        name: contact.name.trim(),
        email: contact.email.trim(),
        phone: contact.phone.trim(),
        notes: contact.notes.trim(),
      },
      options: decision.audit.options,
      metrics: decision.audit.metrics,
      triage: { status: decision.status, reasons: decision.reasons, evaluatedAt: decision.audit.evaluatedAt },
    });
    return { ok: true, receipt };
  } catch (error) {
    const failure = error instanceof ManualQuoteSubmissionError ? error.kind : 'NETWORK';
    return { ok: false, reason: 'FAILED', failure };
  }
};
