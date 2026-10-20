import type { Resource } from 'i18next';

/**
 * Every JSON file under ./locales/<language>/<namespace>.json is picked up automatically.
 * Adding a language = adding one folder with the same JSON files as ./locales/es.
 */
const files = import.meta.glob<Record<string, unknown>>('./locales/*/*.json', { eager: true, import: 'default' });

export const resources: Resource = {};
for (const [path, content] of Object.entries(files)) {
  const match = /\.\/locales\/([^/]+)\/([^/]+)\.json$/.exec(path);
  if (!match) continue;
  const [, language, namespace] = match as unknown as [string, string, string];
  resources[language] = { ...resources[language], [namespace]: content };
}

export const DEFAULT_LANGUAGE = 'es';
export const NAMESPACES = ['common', 'company', 'quote'] as const;
/** Default language first, then the rest alphabetically. */
export const SUPPORTED_LANGUAGES: readonly string[] = [
  DEFAULT_LANGUAGE,
  ...Object.keys(resources)
    .filter((language) => language !== DEFAULT_LANGUAGE)
    .sort(),
];
