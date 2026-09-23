import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type LayoutProps = {
  id?: string;
  className?: string;
  children: ReactNode;
};

/** The one place that owns page width and side gutters. */
export function Container({ className, children }: Omit<LayoutProps, 'id'>) {
  return <div className={cn('mx-auto w-full max-w-3xl px-6', className)}>{children}</div>;
}

/** The one place that owns section spacing — sections themselves only own content. */
export function Section({ id, className, children }: LayoutProps) {
  return (
    <section id={id} className={cn('py-16 sm:py-24', className)}>
      <Container>{children}</Container>
    </section>
  );
}
