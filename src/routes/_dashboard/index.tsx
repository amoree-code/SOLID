import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from '@/shared/i18n/use-translation';

export const Route = createFileRoute('/_dashboard/')({
  component: DashboardHome,
});

function DashboardHome() {
  const { t } = useTranslation('navigation');
  return <h1 className="text-2xl font-semibold">{t('nav.dashboard')}</h1>;
}
