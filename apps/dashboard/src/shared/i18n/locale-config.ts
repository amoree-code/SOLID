import type { Direction, Locale } from './locale.types';

export const DEFAULT_LOCALE: Locale = 'en';

const LOCALE_DIRECTIONS: Record<Locale, Direction> = {
  en: 'ltr',
  ar: 'rtl',
  ckb: 'rtl',
  ku: 'ltr',
};

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  ckb: 'کوردیی ناوەندی',
  ku: 'Kurmancî',
};

export function getDirection(locale: Locale): Direction {
  return LOCALE_DIRECTIONS[locale];
}
