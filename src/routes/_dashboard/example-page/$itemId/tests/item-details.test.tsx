import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/shared/testing/render';
import { itemDetailOptions } from '../../queries/item.queries';
import { ItemDetails } from '../components/item-details';

describe('ItemDetails', () => {
  it('renders the item and falls back to a read-only view without update permission', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(itemDetailOptions('1').queryKey, {
      id: '1',
      name: 'Example item',
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    await renderWithProviders(<ItemDetails itemId="1" />, { queryClient });

    expect(await screen.findByRole('heading', { name: 'Example item' })).toBeInTheDocument();
    expect(screen.getByText(/status: active/i)).toBeInTheDocument();
  });
});
