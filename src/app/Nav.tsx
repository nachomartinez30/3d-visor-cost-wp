import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from '../branding/Logo';
import { LanguageSwitcher } from '../i18n/LanguageSwitcher';

const LINKS = ['services', 'about', 'process', 'quote', 'contact'] as const;

export function Nav() {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  return (
    <header className="nav">
      <div className="container nav__inner">
        <a href="#top" className="nav__brand" aria-label={t('nav.home')}>
          <Logo />
        </a>
        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="visually-hidden">{t('nav.menu')}</span>
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <nav id="primary-nav" className={`nav__links${open ? ' is-open' : ''}`} aria-label={t('nav.label')}>
          <ul>
            {LINKS.map((link) => (
              <li key={link}>
                <a
                  href={`#${link}`}
                  className={link === 'quote' ? 'button button--primary button--small' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {t(`nav.${link}`)}
                </a>
              </li>
            ))}
          </ul>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
