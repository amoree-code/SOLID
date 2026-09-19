import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import type { RouterContext } from '@/app/router/router-context';
import { currentUserOptions } from '@/shared/auth/session';
import { QueryErrorBoundary } from '@/shared/query/query-error-boundary';

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    await context.queryClient.ensureQueryData(currentUserOptions());
  },
  component: RootLayout,
});

function RootLayout() {
  return (
    <QueryErrorBoundary>
      <Outlet />
    </QueryErrorBoundary>
  );
}
