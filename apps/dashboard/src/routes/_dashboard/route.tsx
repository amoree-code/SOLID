import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getSessionUser } from '@/shared/auth/session';
import { DashboardHeader } from '@/shared/components/layout/dashboard-header';
import { DashboardSidebar } from '@/shared/components/layout/dashboard-sidebar';

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
    <div className="flex h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
