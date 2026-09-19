export const SUPPORTED_LOCALES = ['en', 'ar', 'ckb', 'ku'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type Direction = 'ltr' | 'rtl';

export type TranslationNamespace = 'common' | 'auth' | 'navigation';

export type Translations = Record<string, string>;
