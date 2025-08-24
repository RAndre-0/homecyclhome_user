import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('navigates to booking page via hero link', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /réparation et entretien de vélo à domicile/i })).toBeVisible();
    await page.getByRole('link', { name: /prendre rendez-vous/i }).click();
    await expect(page).toHaveURL(/\/book$/);
    await expect(page.getByRole('heading', { name: /nouvelle demande d/i })).toBeVisible();
  });
});
