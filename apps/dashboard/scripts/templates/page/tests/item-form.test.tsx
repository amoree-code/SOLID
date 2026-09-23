import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/shared/testing/render';
import { ItemForm } from '../components/item-form';

describe('ItemForm', () => {
  it('submits valid item data', async () => {
    const onSubmit = vi.fn();
    await renderWithProviders(<ItemForm isSubmitting={false} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/name/i), 'Example');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({ name: 'Example', status: 'active' });
  });

  it('rejects a name shorter than 2 characters', async () => {
    const onSubmit = vi.fn();
    await renderWithProviders(<ItemForm isSubmitting={false} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/name/i), 'a');
    await userEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/at least 2/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
