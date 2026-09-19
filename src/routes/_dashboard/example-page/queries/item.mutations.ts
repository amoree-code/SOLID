import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createItem } from '../services/create-item.service';
import { deleteItem } from '../services/delete-item.service';
import { updateItem } from '../services/update-item.service';
import { itemKeys } from './item.keys';

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateItem,
    onSuccess: async (item) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: itemKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: itemKeys.detail(item.id) }),
      ]);
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}
