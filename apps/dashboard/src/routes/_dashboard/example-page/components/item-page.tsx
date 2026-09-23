import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { useTranslation } from '@/shared/i18n/use-translation';
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
  const { t } = useTranslation('items');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <PermissionGuard permission={itemPermissions.create}>
          <Button onClick={() => setCreateOpen(true)}>{t('new')}</Button>
        </PermissionGuard>
      </div>
      <ItemFilter />
      <ItemTable data={query.data} />
      <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('new')}</DialogTitle>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
