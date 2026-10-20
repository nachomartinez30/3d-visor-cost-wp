import type { Formatters } from '../../../i18n/format';
import type { TriageReason } from '../domain/triage';

/** Formats the measured value and limit of a triage reason for the translated message. */
export const reasonParams = (reason: TriageReason, format: Formatters, currency: string) => {
  const value = (n: number): string => {
    switch (reason.code) {
      case 'SUPPORTS_REQUIRED':
        return format.percent(n);
      case 'UNSUPPORTED_OVERHANG':
        return format.number(n, 0);
      case 'OVERSIZED':
      case 'TOO_SMALL':
        return format.number(n, 1);
      case 'FINE_DETAIL':
        return format.number(n, 2);
      case 'HIGH_PRICE':
        return format.money(n, currency);
      case 'LONG_PRINT':
        return format.number(n, 1);
      default:
        return format.integer(n);
    }
  };
  return { measured: value(reason.measured), limit: value(reason.limit) };
};
