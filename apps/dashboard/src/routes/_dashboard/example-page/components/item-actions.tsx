import { Button } from '@/shared/components/ui/button';
import { useTranslation } from '@/shared/i18n/use-translation';
import { PermissionGuard } from '@/shared/permissions/permission-guard';
import { itemPermissions } from '../permissions';
import { useDeleteItem } from '../queries/item.mutations';
import type { Item } from '../types';

export function ItemActions({ item }: { item: Item }) {
  const deleteMutation = useDeleteItem();
  const { t } = useTranslation('common');

  return (
    <PermissionGuard permission={itemPermissions.delete}>
      <Button
        variant="ghost"
        size="sm"
        disabled={deleteMutation.isPending}
        onClick={() => deleteMutation.mutate(item.id)}
      >
        {t('actions.delete')}
      </Button>
    </PermissionGuard>
  );
}
