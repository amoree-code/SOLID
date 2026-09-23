import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useTranslation } from '@/shared/i18n/use-translation';
import { PermissionGuard } from '@/shared/permissions/permission-guard';
import { ItemForm } from '../../components/item-form';
import { itemPermissions } from '../../permissions';
import { useUpdateItem } from '../../queries/item.mutations';
import { itemDetailOptions } from '../../queries/item.queries';

type ItemDetailsProps = {
  itemId: string;
};

export function ItemDetails({ itemId }: ItemDetailsProps) {
  const query = useSuspenseQuery(itemDetailOptions(itemId));
  const updateMutation = useUpdateItem();
  const item = query.data;
  const { t } = useTranslation('items');

  return (
    <div className="flex flex-col gap-4">
      <Link to="/example-page" className="text-sm underline underline-offset-4">
        {t('back')}
      </Link>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>{item.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <PermissionGuard
            permission={itemPermissions.update}
            fallback={
              <p className="text-sm text-muted-foreground">
                {t('form.status')}: {t(`status.${item.status}`)}
              </p>
            }
          >
            <ItemForm
              defaultValues={{ name: item.name, status: item.status }}
              isSubmitting={updateMutation.isPending}
              submitError={updateMutation.error}
              onSubmit={(values) => updateMutation.mutate({ id: item.id, ...values })}
            />
          </PermissionGuard>
        </CardContent>
      </Card>
    </div>
  );
}
