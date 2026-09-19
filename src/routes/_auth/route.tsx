import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { getSessionUser } from '@/shared/auth/session';

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context }) => {
    if (getSessionUser(context.queryClient)) {
      throw redirect({ to: '/' });
    }
  },
  component: () => (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Outlet />
    </div>
  ),
});
