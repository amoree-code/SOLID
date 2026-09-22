import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { PermissionGuard } from '@/shared/permissions/permission-guard';
import { itemPermissions } from '../permissions';
import { useCreateItem } from '../queries/item.mutations';
import { itemListOptions } from '../queries/item.queries';
import type { ItemSearch } from '../schemas/item-search.schema';
import { ItemFilter } from './item-filter';
import { ItemForm } from './item-form';
import { ItemTable } from './item-table';

type ItemPageProps = {
  search: ItemSearch;
};

export function ItemPage({ search }: ItemPageProps) {
  const [isCreateOpen, setCreateOpen] = useState(false);
  const query = useSuspenseQuery(itemListOptions(search));
  const createMutation = useCreateItem();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Items</h1>
        <PermissionGuard permission={itemPermissions.create}>
          <Button onClick={() => setCreateOpen(true)}>New item</Button>
        </PermissionGuard>
      </div>
      <ItemFilter />
      <ItemTable data={query.data} />
      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">New item</h2>
            <ItemForm
              isSubmitting={createMutation.isPending}
              submitError={createMutation.error}
              onCancel={() => setCreateOpen(false)}
              onSubmit={(values) => {
                createMutation.mutate(values, {
                  onSuccess: () => setCreateOpen(false),
                });
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
