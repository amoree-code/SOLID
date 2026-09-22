import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getSessionUser } from '@/shared/auth/session';
import { AppSidebar } from '@/shared/components/app-sidebar';
import { SiteHeader } from '@/shared/components/site-header';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: ({ context }) => {
    if (!getSessionUser(context.queryClient)) {
      throw redirect({ to: '/login' });
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <SidebarProvider
      style={{ '--header-height': 'calc(var(--spacing) * 12)' } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
