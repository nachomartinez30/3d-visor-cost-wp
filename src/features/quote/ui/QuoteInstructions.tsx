import { useTranslation } from 'react-i18next';
import { useFormatters } from '../../../i18n/format';
import type { QuoteConfig } from '../domain/quoteConfig';

/** Demo files in public/samples (one AUTO, two REVIEW). */
const SAMPLES = [
  ['cube-30mm.stl', 'cube'],
  ['t-shape-overhang.stl', 'tShape'],
  ['floating-island.stl', 'island'],
] as const;

export function QuoteInstructions({ config }: { readonly config: QuoteConfig }) {
  const { t } = useTranslation('quote');
  const format = useFormatters();
  const { x, y, z } = config.triage.buildVolumeMm;
  return (
    <div className="instructions">
      <div className="instructions__col">
        <h3>{t('instructions.autoTitle')}</h3>
        <ol className="instructions__steps">
          <li>{t('instructions.step1', { formats: config.upload.acceptedExtensions.map((e) => `.${e}`).join(', ') })}</li>
          <li>{t('instructions.step2')}</li>
          <li>{t('instructions.step3')}</li>
        </ol>
        <p className="muted">
          {t('instructions.samples')}{' '}
          {SAMPLES.map(([file, key], i) => (
            <span key={file}>
              {i > 0 && ' · '}
              <a href={`${import.meta.env.BASE_URL}samples/${file}`} download>
                {t(`instructions.sampleFiles.${key}`)}
              </a>
            </span>
          ))}
        </p>
        <p className="muted">
          {t('instructions.limits', {
            maxMb: format.bytesAsMb(config.upload.maxFileSizeBytes),
            x: format.integer(x),
            y: format.integer(y),
            z: format.integer(z),
          })}
        </p>
      </div>
      <div className="instructions__col instructions__col--manual">
        <h3>{t('instructions.manualTitle')}</h3>
        <p>{t('instructions.manualIntro')}</p>
        <ul className="instructions__list">
          <li>{t('instructions.manualSupports')}</li>
          <li>{t('instructions.manualIslands')}</li>
          <li>{t('instructions.manualDetail')}</li>
          <li>{t('instructions.manualSize')}</li>
        </ul>
        <p className="muted">{t('instructions.estimateNote')}</p>
      </div>
    </div>
  );
}
