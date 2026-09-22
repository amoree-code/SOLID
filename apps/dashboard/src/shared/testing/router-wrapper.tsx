import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import type { ReactElement } from 'react';

/**
 * Renders a single component behind a throwaway one-route router, for tests
 * that use router primitives (`Link`, `useNavigate`) without a real route tree.
 */
export function renderWithRouter(element: ReactElement, initialPath = '/') {
  const rootRoute = createRootRoute();
  const testRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: initialPath,
    component: () => element,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([testRoute]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });

  return <RouterProvider router={router} />;
}
