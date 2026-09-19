import { Link } from '@tanstack/react-router';
import { useTranslation } from '@/shared/i18n/use-translation';
import { cn } from '@/shared/utils/cn';

const navItems = [
  { to: '/', labelKey: 'nav.dashboard' },
  { to: '/example-page', labelKey: 'nav.exampleItems' },
] as const;

export function DashboardSidebar() {
  const { t } = useTranslation('navigation');

  return (
    <nav className="flex w-56 flex-col gap-1 border-r border-border p-4">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: item.to === '/' }}
          className={cn(
            'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )}
          activeProps={{ className: 'bg-accent text-accent-foreground' }}
        >
          {t(item.labelKey)}
        </Link>
      ))}
    </nav>
  );
}
