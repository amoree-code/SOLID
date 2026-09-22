import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { VerifyForm } from '@/routes/_auth/verify/components/verify-form';
import { renderWithProviders } from '@/shared/testing/render';

describe('VerifyForm', () => {
  it('rejects a code shorter than 6 digits', async () => {
    await renderWithProviders(<VerifyForm />);

    await userEvent.type(screen.getByLabelText(/verification code/i), '123');
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));

    expect(await screen.findByText(/exactly 6 character/i)).toBeInTheDocument();
  });
});
