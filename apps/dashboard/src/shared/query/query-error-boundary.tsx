import { QueryErrorResetBoundary } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ErrorBoundary } from '@/shared/components/feedback/error-boundary';
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
            <div role="alert" className="flex flex-col items-center gap-3 p-8 text-center">
              <p className="text-sm text-muted-foreground">{getErrorMessage(error)}</p>
              <button
                type="button"
                onClick={resetBoundary}
                className="text-sm font-medium underline underline-offset-4"
              >
                Try again
              </button>
            </div>
          )}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
