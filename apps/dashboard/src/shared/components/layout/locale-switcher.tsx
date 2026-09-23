import { useLocale } from '@/app/providers/locale-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { type Locale, SUPPORTED_LOCALES } from '@/shared/i18n/locale.types';
import { LOCALE_LABELS } from '@/shared/i18n/locale-config';
import { useTranslation } from '@/shared/i18n/use-translation';

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation('common');

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger size="sm" aria-label={t('language.label')}>
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
