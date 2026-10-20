import { useTranslation } from 'react-i18next';
import { testimonials } from '../data/company.mock';

export function Testimonials() {
  const { t } = useTranslation('company');
  return (
    <section className="section section--alt" id="testimonials" aria-labelledby="testimonials-title">
      <div className="container">
        <p className="eyebrow">{t('testimonials.eyebrow')}</p>
        <h2 id="testimonials-title">{t('testimonials.title')}</h2>
        <ul className="card-grid card-grid--3">
          {testimonials.map(({ id }) => (
            <li className="card testimonial" key={id}>
              <blockquote>
                <p>“{t(`testimonials.items.${id}.quote`)}”</p>
              </blockquote>
              <p className="testimonial__author">
                <strong>{t(`testimonials.items.${id}.author`)}</strong>
                <span>{t(`testimonials.items.${id}.role`)}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
