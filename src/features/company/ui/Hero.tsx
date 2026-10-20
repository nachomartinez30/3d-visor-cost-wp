import { useTranslation } from 'react-i18next';
import { companyImages } from '../data/images';

export function Hero() {
  const { t } = useTranslation('company');
  const image = companyImages.hero;
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="container hero__inner">
        <div className="hero__copy">
          <p className="eyebrow eyebrow--light">{t('hero.eyebrow')}</p>
          <h1 id="hero-title">{t('hero.title')}</h1>
          <p className="hero__lead">{t('hero.lead')}</p>
          <div className="hero__actions">
            <a className="button button--primary" href="#quote">
              {t('hero.cta')}
            </a>
            <a className="button button--ghost" href="#services">
              {t('hero.secondaryCta')}
            </a>
          </div>
        </div>
        <img className="hero__image" src={image.src} alt={t('images.hero.alt')} width={700} height={520} />
      </div>
    </section>
  );
}
