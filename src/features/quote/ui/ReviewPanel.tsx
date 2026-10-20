import { useTranslation } from 'react-i18next';
import { useFormatters } from '../../../i18n/format';
import type { ManualQuoteGateway } from '../application/ports';
import type { ReviewQuote } from '../domain/quoteDecision';
import { ManualQuoteForm } from './ManualQuoteForm';
import { reasonParams } from './reasonParams';

interface ReviewPanelProps {
  readonly decision: ReviewQuote;
  readonly file: File;
  readonly currency: string;
  readonly gateway: ManualQuoteGateway;
}

/** REVIEW decisions: explain why (no price is ever shown here) and collect contact details. */
export function ReviewPanel({ decision, file, currency, gateway }: ReviewPanelProps) {
  const { t } = useTranslation('quote');
  const format = useFormatters();
  return (
    <section className="result result--review" aria-labelledby="review-title" aria-live="polite">
      <p className="badge badge--warning">{t('review.badge')}</p>
      <h3 id="review-title">{t('review.title')}</h3>
      <p>{t('review.intro')}</p>
      <ul className="reasons">
        {decision.reasons.map((reason) => (
          <li key={reason.code}>{t(`triage.reasons.${reason.code}`, reasonParams(reason, format, currency))}</li>
        ))}
      </ul>
      <ManualQuoteForm key={`${file.name}-${file.lastModified}`} file={file} decision={decision} gateway={gateway} />
    </section>
  );
}
