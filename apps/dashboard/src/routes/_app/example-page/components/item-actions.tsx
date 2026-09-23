import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/shared/components/feedback/confirm-dialog';
import { Button } from '@/shared/components/ui/button';
import { getErrorMessage } from '@/shared/services/error-normalizer';
import { useDeleteItem } from '../queries/item.mutations';
import type { Item } from '../types';

export function ItemActions({ item }: { item: Item }) {
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const deleteMutation = useDeleteItem();

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(true)}>
        Delete
      </Button>
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete "${item.name}"?`}
        description={
          deleteMutation.error ? getErrorMessage(deleteMutation.error) : 'This cannot be undone.'
        }
        confirmLabel="Delete"
        destructive
        isPending={deleteMutation.isPending}
        onConfirm={() =>
          // mutateAsync, not mutate: deleting removes this row, and mutate()'s
          // per-call callbacks are skipped once the component has unmounted.
          deleteMutation.mutateAsync(item.id).then(
            () => {
              setConfirmOpen(false);
              toast.success(`Deleted "${item.name}".`);
            },
            // Not swallowed: the failure is shown in the dialog via deleteMutation.error.
            () => {},
          )
        }
      />
    </>
  );
}
