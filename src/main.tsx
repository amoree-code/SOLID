import { RouterProvider } from '@tanstack/react-router';
import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { appConfig } from '@/app/config/app-config';
import { AppProviders } from '@/app/providers/app-providers';
import { createAppRouter } from '@/app/router/router';
import { createQueryClient } from '@/shared/query/query-client';
import '@/app/styles/globals.css';

document.title = appConfig.name;

const queryClient = createQueryClient();
const router = createAppRouter({ queryClient });

const RouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/router-devtools').then((mod) => ({ default: mod.TanStackRouterDevtools })),
    )
  : null;

function App() {
  return (
    <AppProviders queryClient={queryClient}>
      <RouterProvider router={router} />
      {RouterDevtools ? (
        <Suspense fallback={null}>
          <RouterDevtools router={router} />
        </Suspense>
      ) : null}
    </AppProviders>
  );
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
