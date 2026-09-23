import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createTestQueryClient } from '@/shared/testing/query-wrapper';
import { itemKeys } from '../queries/item.keys';
import { useCreateItem, useDeleteItem, useUpdateItem } from '../queries/item.mutations';
import { createItem } from '../services/create-item.service';
import { deleteItem } from '../services/delete-item.service';
import { updateItem } from '../services/update-item.service';
import type { Item } from '../types';

vi.mock('../services/create-item.service', () => ({ createItem: vi.fn() }));
vi.mock('../services/update-item.service', () => ({ updateItem: vi.fn() }));
vi.mock('../services/delete-item.service', () => ({ deleteItem: vi.fn() }));

const item: Item = { id: '1', name: 'Example', status: 'active', createdAt: '2026-01-01' };

function setup() {
  const queryClient = createTestQueryClient();
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, invalidate, wrapper };
}

describe('item mutations', () => {
  it('create invalidates every item list', async () => {
    vi.mocked(createItem).mockResolvedValue(item);
    const { invalidate, wrapper } = setup();
    const { result } = renderHook(() => useCreateItem(), { wrapper });

    await act(() => result.current.mutateAsync({ name: 'Example', status: 'active' }));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: itemKeys.lists() });
  });

  it('update writes the detail cache and invalidates lists', async () => {
    const updated = { ...item, name: 'Renamed' };
    vi.mocked(updateItem).mockResolvedValue(updated);
    const { queryClient, invalidate, wrapper } = setup();
    const { result } = renderHook(() => useUpdateItem(), { wrapper });

    await act(() => result.current.mutateAsync({ id: '1', name: 'Renamed', status: 'active' }));

    expect(queryClient.getQueryData(itemKeys.detail('1'))).toEqual(updated);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: itemKeys.lists() });
  });

  it('delete drops the detail cache and invalidates lists', async () => {
    vi.mocked(deleteItem).mockResolvedValue();
    const { queryClient, invalidate, wrapper } = setup();
    queryClient.setQueryData(itemKeys.detail('1'), item);
    const { result } = renderHook(() => useDeleteItem(), { wrapper });

    await act(() => result.current.mutateAsync('1'));

    expect(queryClient.getQueryData(itemKeys.detail('1'))).toBeUndefined();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: itemKeys.lists() });
  });

  it('does not invalidate anything when the request fails', async () => {
    vi.mocked(createItem).mockRejectedValue(new Error('boom'));
    const { invalidate, wrapper } = setup();
    const { result } = renderHook(() => useCreateItem(), { wrapper });

    act(() => result.current.mutate({ name: 'Example', status: 'active' }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });
});
