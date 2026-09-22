import { expect, test } from '@playwright/test';

test.describe('unauthenticated access', () => {
  test('redirects the root to the login page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('redirects a protected route to the login page', async ({ page }) => {
    await page.goto('/example-page');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('shows validation errors for an invalid login attempt', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('not-an-email');
    await page.getByLabel(/password/i).fill('short');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });
});

test.describe('unknown routes', () => {
  test('shows the not-found page for an unmatched URL', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });
});
