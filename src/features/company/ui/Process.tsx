import { useTranslation } from 'react-i18next';
import { processSteps } from '../data/company.mock';
import { companyImages } from '../data/images';

export function Process() {
  const { t } = useTranslation('company');
  return (
    <section className="section" id="process" aria-labelledby="process-title">
      <div className="container split split--reverse">
        <img
          className="rounded-image"
          src={companyImages.printing.src}
          alt={t('images.printing.alt')}
          loading="lazy"
          width={560}
          height={420}
        />
        <div>
          <p className="eyebrow">{t('process.eyebrow')}</p>
          <h2 id="process-title">{t('process.title')}</h2>
          <ol className="steps">
            {processSteps.map((step) => (
              <li key={step}>
                <h3>{t(`process.steps.${step}.title`)}</h3>
                <p>{t(`process.steps.${step}.description`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
