import { type Locale, SUPPORTED_LOCALES, useLocale } from '@/app/providers/locale-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

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
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger size="sm" aria-label="Language">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LOCALES.map((code) => (
          <SelectItem key={code} value={code}>
            {LOCALE_LABELS[code]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
