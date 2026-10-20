import type { GeometryMetrics } from './geometry';
import { estimatePrice, type PriceEstimate } from './pricing';
import type { QuoteConfig, TriageThresholds } from './quoteConfig';
import type { QuoteOptions } from './quoteOptions';
import { evaluateTriage, type TriageReason } from './triage';

/** Everything needed to explain a triage decision later. */
export interface TriageAudit {
  readonly evaluatedAt: string;
  readonly metrics: GeometryMetrics;
  readonly options: QuoteOptions;
  readonly thresholds: TriageThresholds;
  readonly reasons: readonly TriageReason[];
}

export interface AutoQuote {
  readonly status: 'AUTO';
  readonly estimate: PriceEstimate;
  readonly reasons: readonly [];
  readonly audit: TriageAudit;
}

/** A REVIEW decision has no price on purpose: it must be quoted manually. */
export interface ReviewQuote {
  readonly status: 'REVIEW';
  readonly reasons: readonly TriageReason[];
  readonly audit: TriageAudit;
}

export type QuoteDecision = AutoQuote | ReviewQuote;

export interface DecideQuoteInput {
  readonly metrics: GeometryMetrics;
  readonly options: QuoteOptions;
  readonly config: QuoteConfig;
  readonly now: Date;
}

export const decideQuote = ({ metrics, options, config, now }: DecideQuoteInput): QuoteDecision => {
  const estimate = estimatePrice(metrics, options, config);
  const triage = evaluateTriage(metrics, estimate, config.triage);
  const audit: TriageAudit = {
    evaluatedAt: now.toISOString(),
    metrics,
    options,
    thresholds: config.triage,
    reasons: triage.reasons,
  };
  if (triage.status === 'AUTO') return { status: 'AUTO', estimate, reasons: [], audit };
  return { status: 'REVIEW', reasons: triage.reasons, audit };
};
