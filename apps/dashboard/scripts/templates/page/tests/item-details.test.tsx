import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTestQueryClient } from '@/shared/testing/query-wrapper';
import { renderWithProviders } from '@/shared/testing/render';
import { ItemDetails } from '../$itemId/components/item-details';
import { itemDetailOptions } from '../queries/item.queries';

describe('ItemDetails', () => {
  it('renders the cached item with an editable form prefilled from it', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(itemDetailOptions('1').queryKey, {
      id: '1',
      name: 'Example item',
      status: 'inactive',
      createdAt: new Date().toISOString(),
    });

    await renderWithProviders(<ItemDetails itemId="1" />, { queryClient });

    expect(await screen.findByRole('heading', { name: 'Example item' })).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue('Example item');
    expect(screen.getByRole('combobox', { name: /status/i })).toHaveTextContent('Inactive');
  });
});
