import { Page, expect } from '@playwright/test';

export class RegisterPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/register', { waitUntil: 'networkidle' });
    await expect(this.page.getByText(/création de compte/i)).toBeVisible();
  }

  // Option 1 : par label exact (recommandé)
  get firstname() { return this.page.getByLabel('Prénom', { exact: true }); }
  get lastname()  { return this.page.getByLabel('Nom', { exact: true }); }
  get email()     { return this.page.getByLabel('Email', { exact: true }); }
  get phone()     { return this.page.getByLabel(/Numéro de téléphone/i); }
  get password()  { return this.page.getByLabel('Mot de passe', { exact: true }); }
  get submit()    { return this.page.getByRole('button', { name: /s'inscrire|chargement/i }); }
  get errorBox()  { return this.page.getByText(/une erreur est survenue lors de l'inscription/i); }

  async fillForm(d: { firstname?: string; lastname?: string; email?: string; phone?: string; password?: string; }) {
    if (d.firstname) await this.firstname.fill(d.firstname);
    if (d.lastname)  await this.lastname.fill(d.lastname);
    if (d.email)     await this.email.fill(d.email);
    if (d.phone)     await this.phone.fill(d.phone);
    if (d.password)  await this.password.fill(d.password);
  }

  async submitForm() { await this.submit.click(); }
}
