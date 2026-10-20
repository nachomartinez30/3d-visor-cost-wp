import { useTranslation } from 'react-i18next';
import { useFormatters } from '../../../i18n/format';
import { stats } from '../data/company.mock';
import { companyImages } from '../data/images';

export function About() {
  const { t } = useTranslation('company');
  const format = useFormatters();
  return (
    <section className="section section--alt" id="about" aria-labelledby="about-title">
      <div className="container split">
        <div>
          <p className="eyebrow">{t('about.eyebrow')}</p>
          <h2 id="about-title">{t('about.title')}</h2>
          <p>{t('about.body1')}</p>
          <p>{t('about.body2')}</p>
          <dl className="stats">
            {stats.map((stat) => (
              <div className="stats__item" key={stat.id}>
                <dt>{t(`stats.${stat.id}`)}</dt>
                <dd>
                  {format.integer(stat.value)}
                  {stat.suffix}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <img
          className="rounded-image"
          src={companyImages.farm.src}
          alt={t('images.farm.alt')}
          loading="lazy"
          width={560}
          height={420}
        />
      </div>
    </section>
  );
}
