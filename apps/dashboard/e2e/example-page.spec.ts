import { expect, type Page, test } from '@playwright/test';

// The dashboard talks to a real API at VITE_API_BASE_URL. There is no backend
// in this test run, so each test answers the HTTP calls at the network layer —
// the app bundle itself contains no mocks.
const items = Array.from({ length: 30 }, (_, index) => ({
  id: String(index + 1),
  name: `Item ${index + 1}`,
  status: index % 2 === 0 ? 'active' : 'inactive',
  createdAt: '2026-01-01T00:00:00.000Z',
}));

async function stubItemsApi(page: Page) {
  const listRequests: URL[] = [];

  await page.route(/\/example-resources(\?|$)/, async (route) => {
    const url = new URL(route.request().url());
    listRequests.push(url);
    const pageNumber = Number(url.searchParams.get('page') ?? 1);
    const pageSize = Number(url.searchParams.get('pageSize') ?? 25);
    const status = url.searchParams.get('status');
    const matching = items.filter((item) => status === 'all' || item.status === status);
    const slice = matching.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

    await route.fulfill({
      json: { items: slice, total: matching.length, page: pageNumber, pageSize },
    });
  });

  await page.route(/\/example-resources\/[^/?]+$/, async (route) => {
    const id = new URL(route.request().url()).pathname.split('/').pop();
    const item = items.find((candidate) => candidate.id === id);
    await (item
      ? route.fulfill({ json: item })
      : route.fulfill({ status: 404, json: { message: 'Item not found' } }));
  });

  return listRequests;
}

test.describe('home', () => {
  test('renders without any sign-in and links to the example page', async ({ page }) => {
    await stubItemsApi(page);
    await page.goto('/');
    await page.getByRole('link', { name: 'Open example page' }).click();

    await expect(page).toHaveURL(/\/example-page$/);
    await expect(page.getByRole('heading', { name: 'Items' })).toBeVisible();
  });
});

test.describe('example page', () => {
  test('keeps a filter in the URL across a reload', async ({ page }) => {
    const requests = await stubItemsApi(page);
    await page.goto('/example-page');
    await expect(page.getByRole('link', { name: 'Item 1', exact: true })).toBeVisible();

    await page.getByRole('combobox', { name: 'Status' }).click();
    await page.getByRole('option', { name: 'Inactive' }).click();
    await expect(page).toHaveURL(/status=inactive/);
    await expect(page.getByRole('link', { name: 'Item 2', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Item 1', exact: true })).toBeHidden();

    await page.reload();
    await expect(page.getByRole('combobox', { name: 'Status' })).toHaveText('Inactive');
    expect(requests.at(-1)?.searchParams.get('status')).toBe('inactive');
  });

  test('restores the previous filters on browser back', async ({ page }) => {
    await stubItemsApi(page);
    await page.goto('/example-page?pageSize=10');
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByRole('link', { name: 'Item 11', exact: true })).toBeVisible();

    await page.goBack();
    await expect(page).not.toHaveURL(/page=2/);
    await expect(page).toHaveURL(/pageSize=10/);
    await expect(page.getByRole('link', { name: 'Item 1', exact: true })).toBeVisible();
  });

  test('opens an item detail page from the table', async ({ page }) => {
    await stubItemsApi(page);
    await page.goto('/example-page');

    await page.getByRole('link', { name: 'Item 3', exact: true }).click();

    await expect(page).toHaveURL(/\/example-page\/3$/);
    await expect(page.getByRole('heading', { name: 'Item 3' })).toBeVisible();
    await expect(page.getByLabel('Name')).toHaveValue('Item 3');
  });

  test('shows the API error message when a detail request fails', async ({ page }) => {
    await stubItemsApi(page);
    await page.goto('/example-page/999');

    await expect(page.getByRole('alert')).toContainText('Item not found');
  });
});

test.describe('unknown routes', () => {
  test('shows the not-found page for an unmatched URL', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });
});
