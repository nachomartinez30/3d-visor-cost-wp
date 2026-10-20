import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from './resources';

/** Lists every language folder found under ./locales, labelled in its own language. */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation('common');
  const current = i18n.resolvedLanguage ?? i18n.language;
  return (
    <label className="language-switcher">
      <span className="visually-hidden">{t('language.label')}</span>
      <select value={current} onChange={(event) => void i18n.changeLanguage(event.target.value)}>
        {SUPPORTED_LANGUAGES.map((language) => (
          <option key={language} value={language} lang={language}>
            {i18n.getFixedT(language, 'common')('language.name')}
          </option>
        ))}
      </select>
    </label>
  );
}
