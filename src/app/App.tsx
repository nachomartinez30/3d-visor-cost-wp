import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { About } from '../features/company/ui/About';
import { ContactFooter } from '../features/company/ui/ContactFooter';
import { Hero } from '../features/company/ui/Hero';
import { Process } from '../features/company/ui/Process';
import { Services } from '../features/company/ui/Services';
import { Testimonials } from '../features/company/ui/Testimonials';
import type { QuoteDependencies } from '../features/quote/ui/QuoteDependencies';
import { QuoteSection } from '../features/quote/ui/QuoteSection';
import { createQuoteDependencies } from './compositionRoot';
import { Nav } from './Nav';

export function App({ quoteDeps }: { readonly quoteDeps?: QuoteDependencies }) {
  const { t } = useTranslation('common');
  const deps = useMemo(() => quoteDeps ?? createQuoteDependencies(), [quoteDeps]);
  return (
    <>
      <a className="skip-link" href="#main">
        {t('nav.skip')}
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Services />
        <About />
        <Process />
        <QuoteSection deps={deps} />
        <Testimonials />
      </main>
      <ContactFooter />
    </>
  );
}
