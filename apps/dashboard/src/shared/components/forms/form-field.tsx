import type { ReactNode } from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/components/ui/field';

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: { message?: string };
  description?: string;
  children: ReactNode;
};

/**
 * Label + control + validation message, independent of any form library —
 * pass React Hook Form's `formState.errors.<field>` as `error`.
 */
export function FormField({ label, htmlFor, error, description, children }: FormFieldProps) {
  return (
    <Field data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={error ? [error] : undefined} />
    </Field>
  );
}
