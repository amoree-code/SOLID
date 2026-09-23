import { useState } from 'react';
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
          deleteMutation.mutate(item.id, {
            onSuccess: () => setConfirmOpen(false),
          })
        }
      />
    </>
  );
}
