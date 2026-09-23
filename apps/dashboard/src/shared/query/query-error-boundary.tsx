import { QueryErrorResetBoundary } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ErrorBoundary } from '@/shared/components/feedback/error-boundary';
import { ErrorState } from '@/shared/components/feedback/states';
import { getErrorMessage } from '@/shared/services/error-normalizer';

type QueryErrorBoundaryProps = {
  children: ReactNode;
};

export function QueryErrorBoundary({ children }: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={({ error, reset: resetBoundary }) => (
            <ErrorState message={getErrorMessage(error)} onRetry={resetBoundary} />
          )}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
