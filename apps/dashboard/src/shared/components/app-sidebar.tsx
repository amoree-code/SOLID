import { IconInnerShadowTop, IconLayoutDashboard, IconListDetails } from '@tabler/icons-react';
import { Link, useMatchRoute } from '@tanstack/react-router';
import { appConfig } from '@/app/config/app-config';
import { useSession } from '@/shared/auth/session';
import { NavUser } from '@/shared/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui/sidebar';
import { useTranslation } from '@/shared/i18n/use-translation';

const navItems = [
  { to: '/', labelKey: 'nav.dashboard', icon: IconLayoutDashboard },
  { to: '/example-page', labelKey: 'nav.exampleItems', icon: IconListDetails },
] as const;

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation('navigation');
  const { user } = useSession();
  const matchRoute = useMatchRoute();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">{appConfig.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    tooltip={t(item.labelKey)}
                    isActive={!!matchRoute({ to: item.to, fuzzy: item.to !== '/' })}
                  >
                    <Link to={item.to} activeOptions={{ exact: item.to === '/' }}>
                      <item.icon />
                      <span>{t(item.labelKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>{user ? <NavUser user={user} /> : null}</SidebarFooter>
    </Sidebar>
  );
}
