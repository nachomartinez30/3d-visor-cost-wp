import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { createI18n } from '../i18n/i18n';

/** Renders with an isolated i18n instance (English by default to keep assertions readable). */
export const renderWithI18n = (ui: ReactElement, language = 'en') => {
  const i18n = createI18n(language);
  return { i18n, ...render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>) };
};
