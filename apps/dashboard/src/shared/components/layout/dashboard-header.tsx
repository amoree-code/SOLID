import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { logout, sessionKeys, useSession } from '@/shared/auth/session';
import { Button } from '@/shared/components/ui/button';
import { useTranslation } from '@/shared/i18n/use-translation';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';

export function DashboardHeader() {
  const { t } = useTranslation('navigation');
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await logout();
    await queryClient.invalidateQueries({ queryKey: sessionKeys.currentUser() });
    await navigate({ to: '/login' });
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4">
      <p className="text-sm font-medium">{user?.name}</p>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <LocaleSwitcher />
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          {t('nav.signOut')}
        </Button>
      </div>
    </header>
  );
}
