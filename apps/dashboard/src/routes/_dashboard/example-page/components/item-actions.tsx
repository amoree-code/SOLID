import { Button } from '@/shared/components/ui/button';
import { PermissionGuard } from '@/shared/permissions/permission-guard';
import { itemPermissions } from '../permissions';
import { useDeleteItem } from '../queries/item.mutations';
import type { Item } from '../types';

export function ItemActions({ item }: { item: Item }) {
  const deleteMutation = useDeleteItem();

  return (
    <PermissionGuard permission={itemPermissions.delete}>
      <Button
        variant="ghost"
        size="sm"
        disabled={deleteMutation.isPending}
        onClick={() => deleteMutation.mutate(item.id)}
      >
        Delete
      </Button>
    </PermissionGuard>
  );
}
