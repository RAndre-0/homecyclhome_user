import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should log in with valid credentials', async ({ page }) => {
    // Mock l’API de login
    await page.route('**/login_check', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-jwt' }),
      });
    });

    await page.goto('/login');
    await page.getByLabel(/email/i).fill('b.postiche@gmail.com');
    await page.getByLabel(/mot de passe/i).fill('password123');
    await page.getByRole('button', { name: /connexion/i }).click();

    // Comme window.location.href = "/", on attend juste la home
    await page.waitForURL('**/', { timeout: 10000 });
    await expect(page).toHaveURL(/\/$/);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.route('**/login_check', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Identifiants incorrects' }),
      })
    );

    await page.goto('/login');
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/mot de passe/i).fill('wrong');
    await page.getByRole('button', { name: /connexion/i }).click();

    // On reste sur /login et on voit le message
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByText(/Identifiants incorrects\. Veuillez vérifier votre email et votre mot de passe\./)
    ).toBeVisible();
  });
});
