import { type Locale, SUPPORTED_LOCALES, useLocale } from '@/app/providers/locale-provider';

// Each locale's own name for itself — shown as-is, never translated.
const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  ckb: 'کوردیی ناوەندی',
  ku: 'Kurmancî',
};

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(event) => setLocale(event.target.value as Locale)}
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
