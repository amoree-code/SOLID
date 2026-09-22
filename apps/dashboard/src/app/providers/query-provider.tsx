import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

type QueryProviderProps = {
  queryClient: QueryClient;
  children: ReactNode;
};

export function QueryProvider({ queryClient, children }: QueryProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
