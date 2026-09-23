import { expect, test } from '@playwright/test';

test.describe('empty base', () => {
  test('renders the home page without any API', async ({ page, isMobile }) => {
    const apiRequests: string[] = [];
    page.on('request', (request) => {
      if (['fetch', 'xhr'].includes(request.resourceType())) {
        apiRequests.push(request.url());
      }
    });

    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('pnpm new:page user users')).toBeVisible();
    if (isMobile) {
      // On small screens the sidebar is an off-canvas sheet.
      await page.getByRole('button', { name: 'Toggle Sidebar' }).click();
    }
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    expect(apiRequests).toEqual([]);
  });

  test('switches <html> to right-to-left for Arabic and back', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('combobox', { name: 'Language' }).click();
    await page.getByRole('option', { name: 'العربية' }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    await page.getByRole('combobox', { name: 'Language' }).click();
    await page.getByRole('option', { name: 'English' }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  });

  test('toggles the dark theme', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const startsDark = await html.evaluate((element) => element.classList.contains('dark'));

    await page.getByRole('button', { name: 'Toggle theme' }).click();

    await expect(html).toHaveClass(startsDark ? /^(?!.*\bdark\b)/ : /\bdark\b/);
  });

  test('shows the not-found page for an unmatched URL', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });
});
