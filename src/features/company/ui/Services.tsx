import { useTranslation } from 'react-i18next';
import { services } from '../data/company.mock';
import { ServiceIcon } from './ServiceIcon';

export function Services() {
  const { t } = useTranslation('company');
  return (
    <section className="section" id="services" aria-labelledby="services-title">
      <div className="container">
        <p className="eyebrow">{t('services.eyebrow')}</p>
        <h2 id="services-title">{t('services.title')}</h2>
        <ul className="card-grid">
          {services.map((service) => (
            <li className="card" key={service.id}>
              <ServiceIcon name={service.icon} />
              <h3>{t(`services.items.${service.id}.title`)}</h3>
              <p>{t(`services.items.${service.id}.description`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
