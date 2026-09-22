import { expect, test } from '@playwright/test';

test('home page renders the hero, projects, and contact sections', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Get in touch' })).toBeVisible();
});
