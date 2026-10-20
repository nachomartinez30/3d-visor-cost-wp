import { useTranslation } from 'react-i18next';
import { brand } from '../../../branding/brand';
import { Logo } from '../../../branding/Logo';
import { companyImages } from '../data/images';

export function ContactFooter() {
  const { t } = useTranslation('company');
  const year = new Date().getFullYear();
  return (
    <footer className="footer" id="contact" aria-labelledby="contact-title">
      <div className="container footer__grid">
        <div>
          <Logo />
          <p className="footer__tagline">{t('common:brand.tagline')}</p>
        </div>
        <div>
          <h2 id="contact-title" className="footer__title">
            {t('contact.title')}
          </h2>
          <ul className="footer__list">
            <li>
              <a href={`mailto:${brand.contact.email}`}>{brand.contact.email}</a>
            </li>
            <li>
              <a href={brand.contact.phoneHref}>{brand.contact.phone}</a>
            </li>
            <li>{t('contact.address')}</li>
            <li>{t('contact.hours')}</li>
          </ul>
        </div>
        <div>
          <h2 className="footer__title">{t('credits.title')}</h2>
          <ul className="footer__list footer__credits">
            {Object.values(companyImages).map((image) => (
              <li key={image.id}>
                {t('credits.photoBy')}{' '}
                <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {image.photographer}
                </a>{' '}
                {t('credits.onUnsplash')}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="container footer__legal">{t('contact.legal', { year, name: brand.name })}</p>
    </footer>
  );
}
