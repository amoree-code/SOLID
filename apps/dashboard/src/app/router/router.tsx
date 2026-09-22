import { createRouter } from '@tanstack/react-router';
import { NotFound } from '@/shared/components/feedback/not-found';
import { RouteError } from '@/shared/components/feedback/route-error';
import { routeTree } from '../../routeTree.gen';
import { RoutePending } from './route-pending';
import type { RouterContext } from './router-context';

export function createAppRouter(context: RouterContext) {
  return createRouter({
    routeTree,
    context,
    defaultPreload: 'intent',
    defaultPendingComponent: RoutePending,
    defaultErrorComponent: RouteError,
    defaultNotFoundComponent: NotFound,
    scrollRestoration: true,
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter;
  }
}
