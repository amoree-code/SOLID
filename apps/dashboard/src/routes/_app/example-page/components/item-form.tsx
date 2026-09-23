import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FormField } from '@/shared/components/forms/form-field';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { NativeSelect } from '@/shared/components/ui/native-select';
import { getErrorMessage } from '@/shared/services/error-normalizer';
import { type ItemFormValues, itemFormSchema } from '../schemas/item-form.schema';

type ItemFormProps = {
  defaultValues?: ItemFormValues;
  isSubmitting: boolean;
  submitError?: unknown;
  onSubmit: (values: ItemFormValues) => void;
  onCancel?: () => void;
};

export function ItemForm({
  defaultValues,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
}: ItemFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: defaultValues ?? { name: '', status: 'active' },
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="Name" htmlFor="item-name" error={errors.name}>
        <Input id="item-name" aria-invalid={Boolean(errors.name)} {...register('name')} />
      </FormField>
      <FormField label="Status" htmlFor="item-status" error={errors.status}>
        <NativeSelect id="item-status" {...register('status')}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </NativeSelect>
      </FormField>
      {submitError ? (
        <p role="alert" className="text-sm text-destructive">
          {getErrorMessage(submitError)}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          Save
        </Button>
      </div>
    </form>
  );
}
