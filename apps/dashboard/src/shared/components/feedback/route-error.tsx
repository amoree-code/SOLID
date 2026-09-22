import type { ErrorComponentProps } from '@tanstack/react-router';
import { getErrorMessage } from '@/shared/services/error-normalizer';

export function RouteError({ error, reset }: ErrorComponentProps) {
  return (
    <div
      role="alert"
      className="flex h-full min-h-64 flex-col items-center justify-center gap-3 p-8 text-center"
    >
      <p className="text-sm text-muted-foreground">{getErrorMessage(error)}</p>
      <button
        type="button"
        onClick={reset}
        className="text-sm font-medium underline underline-offset-4"
      >
        Try again
      </button>
    </div>
  );
}
