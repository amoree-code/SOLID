import { useCallback, useMemo } from 'react';
import { useLocale } from '@/app/providers/locale-provider';
import type { TranslationNamespace } from './locale.types';
import { getTranslations, translate } from './translation.service';

export function useTranslation(namespace: TranslationNamespace) {
  const { locale } = useLocale();
  const dict = useMemo(() => getTranslations(locale, namespace), [locale, namespace]);

  const t = useCallback((key: string, fallback?: string) => translate(dict, key, fallback), [dict]);

  return { t, locale };
}
