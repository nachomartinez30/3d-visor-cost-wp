import type { ContactDetails } from '../domain/contactValidation';
import type { GeometryMetrics } from '../domain/geometry';
import type { QuoteDecision } from '../domain/quoteDecision';
import type { QuoteOptions } from '../domain/quoteOptions';
import type { TriageReason, TriageStatus } from '../domain/triage';

/** Turns an uploaded file into a model the analyzer understands. Throws on parse errors. */
export interface ModelLoader<TModel> {
  load(file: File): Promise<TModel>;
}

/** Extracts printability metrics. Swap the browser version for a slicer-backed one later. */
export interface GeometryAnalyzer<TModel> {
  analyze(model: TModel, options: { readonly overhangAngleDeg: number }): Promise<GeometryMetrics>;
}

/** Prices a part. The local version runs the domain engine; a backend/slicer can replace it. */
export interface QuoteEstimator {
  estimate(input: { readonly metrics: GeometryMetrics; readonly options: QuoteOptions }): Promise<QuoteDecision>;
}

export interface ManualQuoteRequest {
  readonly file: File;
  readonly contact: ContactDetails;
  readonly options: QuoteOptions;
  readonly metrics: GeometryMetrics;
  readonly triage: {
    readonly status: TriageStatus;
    readonly reasons: readonly TriageReason[];
    readonly evaluatedAt: string;
  };
}

export interface ManualQuoteReceipt {
  readonly referenceId?: string;
}

export interface ManualQuoteGateway {
  submit(request: ManualQuoteRequest): Promise<ManualQuoteReceipt>;
}

export type SubmissionFailure = 'HTTP' | 'TIMEOUT' | 'NETWORK';

export class ManualQuoteSubmissionError extends Error {
  constructor(
    readonly kind: SubmissionFailure,
    readonly status?: number,
  ) {
    super(`Manual quote submission failed: ${kind}${status ? ` (${status})` : ''}`);
    this.name = 'ManualQuoteSubmissionError';
  }
}
