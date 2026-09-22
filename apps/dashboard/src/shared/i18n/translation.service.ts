import type { Locale, TranslationNamespace, Translations } from './locale.types';
import { DEFAULT_LOCALE } from './locale-config';

const modules = import.meta.glob<Translations>('./locales/*/*.json', {
  eager: true,
  import: 'default',
});

function loadNamespace(locale: Locale, namespace: TranslationNamespace): Translations {
  const path = `./locales/${locale}/${namespace}.json`;
  return modules[path] ?? {};
}

/**
 * Reports keys present in the default locale but missing elsewhere, so a
 * missing translation fails loudly in development instead of degrading silently.
 */
function reportMissingKeys(locale: Locale, namespace: TranslationNamespace, dict: Translations) {
  if (!import.meta.env.DEV || locale === DEFAULT_LOCALE) {
    return;
  }

  const reference = loadNamespace(DEFAULT_LOCALE, namespace);
  const missing = Object.keys(reference).filter((key) => !(key in dict));

  if (missing.length > 0) {
    console.warn(
      `[i18n] locale "${locale}" namespace "${namespace}" is missing: ${missing.join(', ')}`,
    );
  }
}

export function getTranslations(locale: Locale, namespace: TranslationNamespace): Translations {
  const dict = loadNamespace(locale, namespace);
  reportMissingKeys(locale, namespace, dict);
  return dict;
}

export function translate(dict: Translations, key: string, fallback?: string): string {
  return dict[key] ?? fallback ?? key;
}
