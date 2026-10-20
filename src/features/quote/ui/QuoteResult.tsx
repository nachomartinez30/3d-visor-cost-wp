import { useTranslation } from 'react-i18next';
import { useFormatters } from '../../../i18n/format';
import type { GeometryMetrics } from '../domain/geometry';
import type { AutoQuote } from '../domain/quoteDecision';

interface QuoteResultProps {
  readonly decision: AutoQuote;
  readonly metrics: GeometryMetrics;
}

/** Shown ONLY for AUTO decisions (the type requires an AutoQuote). */
export function QuoteResult({ decision, metrics }: QuoteResultProps) {
  const { t } = useTranslation('quote');
  const format = useFormatters();
  const { estimate } = decision;
  const money = (value: number) => format.money(value, estimate.currency);
  const totalMinutes = Math.max(1, Math.round(estimate.printTimeHours * 60));
  const { x, y, z } = metrics.dimensionsMm;
  const rows: [string, number][] = [
    [t('results.material'), estimate.breakdown.material],
    [t('results.machine'), estimate.breakdown.machine],
    [t('results.setup'), estimate.breakdown.setup],
    [t('results.margin'), estimate.breakdown.margin],
  ];
  if (estimate.breakdown.minimumOrderAdjustment > 0) {
    rows.push([t('results.minimumOrder'), estimate.breakdown.minimumOrderAdjustment]);
  }

  return (
    <section className="result result--auto" aria-labelledby="result-title" aria-live="polite">
      <p className="badge badge--success">{t('results.badge')}</p>
      <h3 id="result-title">{t('results.title')}</h3>
      <p className="result__total">
        <span>{t('results.total')}</span>
        <strong data-testid="quote-total">{money(estimate.total)}</strong>
      </p>
      <dl className="metrics">
        <div>
          <dt>{t('results.dimensions')}</dt>
          <dd>{t('results.dimensionsValue', { x: format.number(x), y: format.number(y), z: format.number(z) })}</dd>
        </div>
        <div>
          <dt>{t('results.volume')}</dt>
          <dd>{t('results.volumeValue', { value: format.number(metrics.volumeMm3 / 1000, 1) })}</dd>
        </div>
        <div>
          <dt>{t('results.weight')}</dt>
          <dd>{t('results.weightValue', { value: format.number(estimate.weightGrams, 1) })}</dd>
        </div>
        <div>
          <dt>{t('results.time')}</dt>
          <dd>{t('results.timeValue', { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 })}</dd>
        </div>
      </dl>
      <table className="breakdown">
        <caption>{t('results.breakdown')}</caption>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{money(value)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">{t('results.total')}</th>
            <td>{money(estimate.total)}</td>
          </tr>
        </tfoot>
      </table>
      <p className="muted">{t('results.disclaimer')}</p>
    </section>
  );
}
