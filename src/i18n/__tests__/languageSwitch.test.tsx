import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { initAppI18n, LANGUAGE_STORAGE_KEY } from '../i18n';
import { Nav } from '../../app/Nav';
import { Hero } from '../../features/company/ui/Hero';

afterEach(() => window.localStorage.clear());

const renderApp = () => {
  const i18n = initAppI18n();
  render(
    <I18nextProvider i18n={i18n}>
      <Nav />
      <Hero />
    </I18nextProvider>,
  );
  return i18n;
};

describe('language switching', () => {
  it('starts in Spanish and switches to English from the nav', async () => {
    renderApp();
    expect(document.documentElement.lang).toBe('es');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('De tu archivo 3D a una pieza real');

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Idioma' }), 'en');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('From your 3D file to a real part');
    expect(document.documentElement.lang).toBe('en');
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
  });

  it('restores the stored language', () => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    renderApp();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('From your 3D file');
    expect(document.documentElement.lang).toBe('en');
  });
});
