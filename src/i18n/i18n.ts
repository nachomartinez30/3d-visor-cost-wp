import i18next, { type i18n as I18n } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, NAMESPACES, SUPPORTED_LANGUAGES, resources } from './resources';

export const LANGUAGE_STORAGE_KEY = 'layerform.language';

export const readStoredLanguage = (): string | null => {
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const storeLanguage = (language: string): void => {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Private mode or blocked storage: the choice just won't persist.
  }
};

export const syncDocumentLanguage = (instance: I18n) => {
  const apply = () => {
    if (typeof document !== 'undefined') document.documentElement.lang = instance.resolvedLanguage ?? DEFAULT_LANGUAGE;
  };
  apply();
  instance.on('languageChanged', apply);
};

const baseOptions = {
  resources,
  ns: [...NAMESPACES],
  defaultNS: 'common',
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: [...SUPPORTED_LANGUAGES],
  nonExplicitSupportedLngs: true,
  load: 'languageOnly' as const,
  initAsync: false,
  interpolation: { escapeValue: false }, // React already escapes.
  returnNull: false,
};

/** Creates an isolated, synchronously initialised instance (used by tests). */
export const createI18n = (language: string = DEFAULT_LANGUAGE): I18n => {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({ ...baseOptions, lng: language });
  return instance;
};

/**
 * App instance: stored choice -> ?lng= query string -> <html lang> (es) -> Spanish.
 * The browser language is NOT used on purpose so Spanish stays the default;
 * add 'navigator' to `detection.order` to follow the browser instead.
 * Persistence is done manually so storage errors are always caught.
 */
export const initAppI18n = (): I18n => {
  const instance = i18next.createInstance();
  const stored = readStoredLanguage();
  void instance
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      ...baseOptions,
      ...(stored && SUPPORTED_LANGUAGES.includes(stored) ? { lng: stored } : {}),
      detection: { order: ['querystring', 'htmlTag'], lookupQuerystring: 'lng', caches: [] },
    });
  instance.on('languageChanged', storeLanguage);
  syncDocumentLanguage(instance);
  return instance;
};

