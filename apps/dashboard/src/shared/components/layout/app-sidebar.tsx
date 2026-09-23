import { IconInnerShadowTop, IconLayoutDashboard } from '@tabler/icons-react';
import { Link, useMatchRoute } from '@tanstack/react-router';
import type { ComponentProps } from 'react';
import { appConfig } from '@/app/config/app-config';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui/sidebar';

// Add one entry per page (`pnpm new:page` prints the line to add). Labels are
// plain strings until a project adds its own translation system.
const navItems = [{ to: '/', label: 'Home', icon: IconLayoutDashboard }] as const;

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
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
                    tooltip={item.label}
                    isActive={Boolean(matchRoute({ to: item.to, fuzzy: item.to !== '/' }))}
                  >
                    <Link to={item.to} activeOptions={{ exact: item.to === '/' }}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
