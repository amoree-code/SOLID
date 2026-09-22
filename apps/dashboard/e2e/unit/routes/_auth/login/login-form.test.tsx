import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { LoginForm } from '@/routes/_auth/login/components/login-form';
import { renderWithProviders } from '@/shared/testing/render';

describe('LoginForm', () => {
  it('shows validation errors for an invalid email and short password', async () => {
    await renderWithProviders(<LoginForm />);

    await userEvent.type(screen.getByLabelText(/email/i), 'not-an-email');
    await userEvent.type(screen.getByLabelText(/password/i), 'short');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });
});
