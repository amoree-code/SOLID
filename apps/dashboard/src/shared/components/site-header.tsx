import { LocaleSwitcher } from '@/shared/components/layout/locale-switcher';
import { ThemeToggle } from '@/shared/components/layout/theme-toggle';
import { Separator } from '@/shared/components/ui/separator';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import { useTranslation } from '@/shared/i18n/use-translation';

export function SiteHeader() {
  const { t } = useTranslation('navigation');

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ms-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{t('nav.dashboard')}</h1>
        <div className="ms-auto flex items-center gap-2">
          <ThemeToggle />
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
