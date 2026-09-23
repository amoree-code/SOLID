import { createFileRoute, Outlet } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import { AppSidebar } from '@/shared/components/layout/app-sidebar';
import { SiteHeader } from '@/shared/components/layout/site-header';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';

export const Route = createFileRoute('/_app')({
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider style={{ '--header-height': 'calc(var(--spacing) * 12)' } as CSSProperties}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
