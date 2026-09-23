import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
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
  const { data } = useSuspenseQuery(itemListOptions(search));
  const createMutation = useCreateItem();

  function handleCreateOpenChange(open: boolean) {
    setCreateOpen(open);
    if (!open) {
      createMutation.reset();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Items"
        description="Reference list page — filters, sorting and paging live in the URL."
        actions={<Button onClick={() => setCreateOpen(true)}>New item</Button>}
      />
      <ItemFilter />
      <ItemTable data={data} />
      <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New item</DialogTitle>
            <DialogDescription>Create a new item.</DialogDescription>
          </DialogHeader>
          <ItemForm
            isSubmitting={createMutation.isPending}
            submitError={createMutation.error}
            onCancel={() => handleCreateOpenChange(false)}
            onSubmit={(values) => {
              createMutation.mutate(values, {
                onSuccess: (item) => {
                  handleCreateOpenChange(false);
                  toast.success(`Created "${item.name}".`);
                },
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
