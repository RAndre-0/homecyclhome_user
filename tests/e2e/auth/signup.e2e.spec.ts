import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/RegisterPage';

const REGISTER_API = '**/api/register';

test.describe('Inscription @signup', () => {
    test('succès : set cookie + redirection vers /', async ({ page, context }) => {
        // Mock API succès
        await page.route(REGISTER_API, async route => {
            if (route.request().method() !== 'POST') return route.continue();
            return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ token: 'fake.jwt.token' }) });
        });

        const reg = new RegisterPage(page);
        await reg.goto();
        await reg.fillForm({
            firstname: 'Alice',
            lastname: 'Martin',
            email: 'alice.martin@example.com',
            phone: '+33612345678',
            password: 'S3cur3P@ss!',
        });

        const [nav] = await Promise.all([
            page.waitForURL('**/'),      // redirection attendue
            reg.submitForm(),
        ]);

        // Cookie défini
        const cookies = await context.cookies();
        const tokenCookie = cookies.find(c => c.name === 'token');
        expect(tokenCookie?.value).toBe('fake.jwt.token');
        expect(tokenCookie?.path).toBe('/');
        // maxAge ~ 3600 s → Playwright ne donne pas maxAge directement, on valide au moins la présence

        // On est sur la home
        await expect(page).toHaveURL(/\/$/);
    });

    test('erreur serveur : message visible + bouton réactivé', async ({ page }) => {
        await page.route(REGISTER_API, route => route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'boom' }),
        }));

        const reg = new RegisterPage(page);
        await reg.goto();
        await reg.fillForm({
            firstname: 'Bob',
            lastname: 'Durand',
            email: 'bob@example.com',
            phone: '+33711112222',
            password: 'S3cur3P@ss!',
        });

        await reg.submitForm();
        await expect(reg.errorBox).toBeVisible();
        await expect(reg.submit).toBeEnabled();
        await expect(page).toHaveURL(/\/register$/); // pas de redirection
    });

    test('validation : le navigateur bloque si champs requis manquants', async ({ page }) => {
        // On trace si une requête partirait (elle ne doit pas)
        let called = 0;
        await page.route(REGISTER_API, () => { called += 1; });

        const reg = new RegisterPage(page);
        await reg.goto();

        // Ne remplir que le prénom pour provoquer la validation HTML5
        await reg.firstname.fill('Charlie');
        await reg.submit.click();

        // Le formulaire ne doit pas partir
        await page.waitForTimeout(300);
        expect(called).toBe(0);
        // Optionnel : vérifier le message de validation du champ email (varie selon navigateur)
        const nativeMessage = await reg.email.evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(nativeMessage).not.toBe(''); // il y a bien un message de validation
    });

    test('validation zod sur phoneNumber : message d’erreur affiché', async ({ page }) => {
        // Aucune route : on s’assure que la soumission n’est pas envoyée
        let called = 0;
        await page.route(REGISTER_API, () => { called += 1; });

        const reg = new RegisterPage(page);
        await reg.goto();

        await reg.fillForm({
            firstname: 'Dana',
            lastname: 'Lopez',
            email: 'dana@example.com',
            phone: '06 00', // invalide selon votre schema
            password: 'S3cur3P@ss!',
        });
        await reg.submit.click();

        await expect(page.getByText(/numéro/i)).toBeVisible(); // votre message d’erreur `formState.errors.phoneNumber.message`
        expect(called).toBe(0);
    });

    test('état de chargement : bouton désactivé et anti double-clic', async ({ page }) => {
        // Simuler une API lente
        await page.route(REGISTER_API, async route => {
            await page.waitForTimeout(800); // latence
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ token: 'slow.jwt' }),
            });
        });

        const reg = new RegisterPage(page);
        await reg.goto();
        await reg.fillForm({
            firstname: 'Eva',
            lastname: 'B',
            email: 'eva@example.com',
            phone: '+33699998888',
            password: 'S3cur3P@ss!',
        });

        // Cliquer plusieurs fois très vite
        await Promise.all([
            reg.submit.click(),
            reg.submit.click(),
            reg.submit.click(),
        ]);

        // Pendant la requête : désactivé + libellé "Chargement..."
        await expect(reg.submit).toBeDisabled();
        await expect(reg.submit).toHaveText(/chargement/i);
    });

    test('accessibilité rapide : libellés et lien vers Connexion', async ({ page }) => {
        const reg = new RegisterPage(page);
        await reg.goto();

        await expect(page.getByRole('textbox', { name: /prénom/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /connexion/i })).toHaveAttribute('href', '/login');
    });
});
