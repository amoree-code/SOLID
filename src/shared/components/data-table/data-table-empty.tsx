import type { ReactNode } from 'react';

export function DataTableEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
