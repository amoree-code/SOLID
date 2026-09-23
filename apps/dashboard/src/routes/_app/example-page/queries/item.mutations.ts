import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createItem } from '../services/create-item.service';
import { deleteItem } from '../services/delete-item.service';
import { updateItem } from '../services/update-item.service';
import { itemKeys } from './item.keys';

// Mutations own cache invalidation; components own what the user sees on
// success or failure.

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: itemKeys.lists() }),
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateItem,
    onSuccess: async (item) => {
      queryClient.setQueryData(itemKeys.detail(item.id), item);
      await queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteItem,
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: itemKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}
