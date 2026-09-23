import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useTranslation } from '@/shared/i18n/use-translation';
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
  const { t } = useTranslation('items');
  const { t: tCommon } = useTranslation('common');
  const {
    control,
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
        <Label htmlFor="item-name">{t('form.name')}</Label>
        <Input id="item-name" {...register('name')} />
        {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="item-status">{t('form.status')}</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="item-status" className="w-full" onBlur={field.onBlur}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t('status.active')}</SelectItem>
                <SelectItem value="inactive">{t('status.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      {submitError ? (
        <p className="text-xs text-destructive">{getErrorMessage(submitError)}</p>
      ) : null}
      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            {tCommon('actions.cancel')}
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {tCommon('actions.save')}
        </Button>
      </div>
    </form>
  );
}
