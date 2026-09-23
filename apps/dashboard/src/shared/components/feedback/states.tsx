import type { ReactNode } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center gap-2 p-6 text-center">
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      {action}
    </div>
  );
}

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex min-h-32 flex-col items-center justify-center gap-3 p-6 text-center"
    >
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <output aria-label="Loading" className="flex flex-col gap-2">
      {Array.from({ length: rows }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders, never reordered
        <Skeleton key={index} className="h-9 w-full" />
      ))}
    </output>
  );
}
