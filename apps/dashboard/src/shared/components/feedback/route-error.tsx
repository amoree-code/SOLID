import type { ErrorComponentProps } from '@tanstack/react-router';
import { getErrorMessage } from '@/shared/services/error-normalizer';
import { ErrorState } from './states';

export function RouteError({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex h-full min-h-64 items-center justify-center">
      <ErrorState message={getErrorMessage(error)} onRetry={reset} />
    </div>
  );
}
