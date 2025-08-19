import { test, expect } from '@playwright/test';

const LOGIN_API = '**/api/login_check';

test.describe('Login Page', () => {
    test('should log in with valid credentials', async ({ page }) => {
        await page.goto('http://localhost/login');

        await page.fill('input[name="email"]', 'testuser@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/dashboard|home/);
        await expect(page.locator('text=Welcome')).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.goto('http://localhost/login');

        await page.fill('input[name="email"]', 'wronguser@example.com');
        await page.fill('input[name="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Invalid credentials')).toBeVisible();
    });
});