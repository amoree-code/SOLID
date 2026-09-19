import { QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { LocaleProvider } from '@/app/providers/locale-provider';
import { createTestQueryClient } from './query-wrapper';

type RenderOptions = {
  path?: string;
};

/**
 * Full-stack test render: query client, locale, and a throwaway single-route
 * router so components using `Link`/`useNavigate` work without a real route tree.
 * Awaits the router's initial load so the component is on screen before this resolves.
 */
export async function renderWithProviders(ui: ReactElement, { path = '/' }: RenderOptions = {}) {
  const queryClient = createTestQueryClient();
  const rootRoute = createRootRoute();
  const testRoute = createRoute({
    getParentRoute: () => rootRoute,
    path,
    component: () => ui,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([testRoute]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  await router.load();

  return render(
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <RouterProvider router={router} />
      </LocaleProvider>
    </QueryClientProvider>,
  );
}
