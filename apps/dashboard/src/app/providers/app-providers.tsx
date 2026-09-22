import type { QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { LocaleProvider } from './locale-provider';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';

type AppProvidersProps = {
  queryClient: QueryClient;
  children: ReactNode;
};

export function AppProviders({ queryClient, children }: AppProvidersProps) {
  return (
    <QueryProvider queryClient={queryClient}>
      <ThemeProvider>
        <LocaleProvider>{children}</LocaleProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
