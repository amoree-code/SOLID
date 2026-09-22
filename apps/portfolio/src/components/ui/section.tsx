import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type SectionProps = {
  id?: string;
  className?: string;
  children: ReactNode;
};

/** The one place that owns section spacing/width — sections themselves only own content. */
export function Section({ id, className, children }: SectionProps) {
  return (
    <section id={id} className={cn('mx-auto w-full max-w-3xl px-6 py-16 sm:py-24', className)}>
      {children}
    </section>
  );
}
