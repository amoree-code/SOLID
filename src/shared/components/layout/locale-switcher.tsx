import { useLocale } from '@/app/providers/locale-provider';
import { SUPPORTED_LOCALES } from '@/shared/i18n/locale.types';
import { LOCALE_LABELS } from '@/shared/i18n/locale-config';

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(event) => setLocale(event.target.value as (typeof SUPPORTED_LOCALES)[number])}
      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
    >
      {SUPPORTED_LOCALES.map((code) => (
        <option key={code} value={code}>
          {LOCALE_LABELS[code]}
        </option>
      ))}
    </select>
  );
}
