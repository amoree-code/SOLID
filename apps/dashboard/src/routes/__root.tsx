import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import type { RouterContext } from '@/app/router/router-context';
import { QueryErrorBoundary } from '@/shared/query/query-error-boundary';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <QueryErrorBoundary>
      <Outlet />
    </QueryErrorBoundary>
  );
}
