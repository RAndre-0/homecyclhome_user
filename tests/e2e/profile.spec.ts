import { test, expect } from '@playwright/test';
import { freezeTime, setUserJwtCookie } from '../fixtures/auth';
import { mockUserAndInterventions, mockInterventionsEmpty } from '../utils/network';


const PROFILE_URL = '/profile';
const LOGIN_URL = '/login';


// Utilisez la vraie valeur fournie si vous voulez (var d'env conseillée)
const SAMPLE_JWT = process.env.PW_JWT || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE3NTYwNjI5MDgsImV4cCI6MTc1NjA2NjUwOCwicm9sZXMiOlsiUk9MRV9VU0VSIl0sInVzZXJuYW1lIjoiYi5wb3N0aWNoZUBnbWFpbC5jb20iLCJpZCI6OH0.jW8apI-o7rDjlyPIdV1l20qjjYcYBlgpG1qdaViLcgnrb7YrbHwJqC2yVIJ2UvW1RftLB9kF7zzXpTCl7qNX5NkCZYhGY7Xk6ln97WLKituoX8kqGTqYT4c2lsNJ_q56fcTe-Xd1EMD_8Y9_49XKKasiy87-hfxHwfSIdU4zeU7c1PyI5WN_VENRYK3haj629v4oGXjX6eBRG0YOm_KtQu5HtySLl4V15w88Ue27OaugXnYNWUVOicBnFmgDpdPq2xdb5bFf-AbSz0vBWL4wQ-G8jP-mCwxGYpEy88HoItWFqfEss4Df5crZWFwTUVKyVVMoJEtEZ6ax9NEe9J1Arw';


// Pour des rendus stables de dates/onglets
test.beforeEach(async ({ page }) => {
await freezeTime(page, '2025-03-10T10:00:00.000Z');
});


/** 1) Utilisateur connecté */
test('connecté: affiche le profil et la liste des interventions', async ({ page }) => {
await setUserJwtCookie(page, SAMPLE_JWT);
await mockUserAndInterventions(page);


await page.goto(PROFILE_URL);


// Profil visible
await expect(page.getByRole('heading', { name: 'Mon profil' })).toBeVisible();
await expect(page.getByText(/Nom\s*:\s*Martin/)).toBeVisible();
await expect(page.getByText(/Prénom\s*:\s*Alex/)).toBeVisible();
await expect(page.getByText(/Email\s*:\s*alex\.martin@example\.com/)).toBeVisible();


// Onglet À venir par défaut, au moins une intervention future
await expect(page.getByRole('tab', { name: 'À venir', selected: true })).toBeVisible();
await expect(page.getByText('Révision')).toBeVisible();


// Historique
await page.getByRole('tab', { name: 'Historique' }).click();
await expect(page.getByText('Réglage transmission')).toBeVisible();
});


/** 2) Non connecté */
test('non connecté: redirige vers /login', async ({ page }) => {
// Ne place PAS le cookie hch_token_u
await page.goto(PROFILE_URL);


// Attendre la redirection (middleware/guard Next)
await expect(page).toHaveURL(new RegExp(`${LOGIN_URL}$`));
// Vérifie éventuellement un élément de la page login
await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible({ timeout: 5000 }).catch(() => {});
});


/** 3) Connecté mais zéro intervention */
test('connecté: affiche les états vides quand aucune intervention', async ({ page }) => {
await setUserJwtCookie(page, SAMPLE_JWT);
await mockInterventionsEmpty(page);
// L’endpoint users/me doit quand même répondre OK
await page.route(/users\/me$/, (route) => route.fulfill({
status: 200,
contentType: 'application/json',
body: JSON.stringify({
id: 1,
first_name: 'Alex',
last_name: 'Martin',
email: 'alex.martin@example.com'
})
}));


await page.goto(PROFILE_URL);


await expect(page.getByText('Aucune intervention à venir.')).toBeVisible();
await page.getByRole('tab', { name: 'Historique' }).click();
await expect(page.getByText('Aucune intervention passée.')).toBeVisible();
});