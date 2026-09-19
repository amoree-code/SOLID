import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
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
      <div className="flex flex-col gap-2">
        <Label htmlFor="item-name">Name</Label>
        <Input id="item-name" {...register('name')} />
        {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="item-status">Status</Label>
        <select
          id="item-status"
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          {...register('status')}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      {submitError ? (
        <p className="text-xs text-destructive">{getErrorMessage(submitError)}</p>
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
