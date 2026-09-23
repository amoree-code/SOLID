import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { AppProviders } from '@/app/providers/app-providers';
import { LocaleProvider } from '@/app/providers/locale-provider';
import { routeTree } from '@/routeTree.gen';
import { createTestQueryClient } from './query-wrapper';

type RenderOptions = {
  path?: string;
  queryClient?: QueryClient;
};

/**
 * Component-level render: query client, locale, and a throwaway single-route
 * router so components using `Link`/`useNavigate` work without a real route tree.
 * Awaits the router's initial load so the component is on screen before this resolves.
 */
export async function renderWithProviders(
  ui: ReactElement,
  { path = '/', queryClient = createTestQueryClient() }: RenderOptions = {},
) {
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

/**
 * Page-level render: the real generated route tree at `url`, so search-param
 * validation, loaders and the page component all run exactly as in the app.
 * Stub the network at the `httpClient` boundary, never inside the page.
 */
export async function renderApp(
  url: string,
  { queryClient = createTestQueryClient() }: Omit<RenderOptions, 'path'> = {},
) {
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [url] }),
  });

  await router.load();

  const result = render(
    <AppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
    </AppProviders>,
  );

  return { ...result, router, queryClient };
}
