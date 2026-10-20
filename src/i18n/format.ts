import { useTranslation } from 'react-i18next';

/** Locale-aware number/currency helpers bound to the active language. */
export const createFormatters = (locale: string) => {
  const number = (value: number, maximumFractionDigits = 1) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value);
  return {
    number,
    integer: (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value),
    money: (value: number, currency: string) =>
      new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value),
    percent: (ratio: number) => new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(ratio),
    bytesAsMb: (bytes: number) => number(bytes / (1024 * 1024), 1),
  };
};

export type Formatters = ReturnType<typeof createFormatters>;

export const useFormatters = (): Formatters => {
  const { i18n } = useTranslation();
  return createFormatters(i18n.resolvedLanguage ?? i18n.language);
};
