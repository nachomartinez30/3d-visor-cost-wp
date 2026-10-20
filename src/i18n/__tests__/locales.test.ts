import { describe, expect, it } from 'vitest';
import { DEFAULT_LANGUAGE, NAMESPACES, SUPPORTED_LANGUAGES, resources } from '../resources';

const flattenKeys = (value: unknown, prefix = ''): string[] =>
  value && typeof value === 'object'
    ? Object.entries(value).flatMap(([key, child]) => flattenKeys(child, prefix ? `${prefix}.${key}` : key))
    : [prefix];

describe('translation resources', () => {
  it('ships Spanish as the default plus English', () => {
    expect(DEFAULT_LANGUAGE).toBe('es');
    expect(SUPPORTED_LANGUAGES[0]).toBe('es');
    expect(SUPPORTED_LANGUAGES).toContain('en');
  });

  it.each(SUPPORTED_LANGUAGES)('"%s" has every namespace', (language) => {
    for (const namespace of NAMESPACES) expect(resources[language]?.[namespace]).toBeDefined();
  });

  it.each(SUPPORTED_LANGUAGES.filter((l) => l !== DEFAULT_LANGUAGE))(
    'every key in "es" exists in "%s" (and no extra keys)',
    (language) => {
      for (const namespace of NAMESPACES) {
        const reference = flattenKeys(resources[DEFAULT_LANGUAGE]?.[namespace]).sort();
        const translated = flattenKeys(resources[language]?.[namespace]).sort();
        expect({ namespace, missing: reference.filter((k) => !translated.includes(k)) }).toEqual({ namespace, missing: [] });
        expect({ namespace, extra: translated.filter((k) => !reference.includes(k)) }).toEqual({ namespace, extra: [] });
      }
    },
  );
});
