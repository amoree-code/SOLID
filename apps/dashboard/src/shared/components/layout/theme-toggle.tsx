import { useTheme } from '@/app/providers/theme-provider';
import { Button } from '@/shared/components/ui/button';
import { useTranslation } from '@/shared/i18n/use-translation';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation('common');

  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={t('theme.toggle')}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? t('theme.light') : t('theme.dark')}
    </Button>
  );
}
