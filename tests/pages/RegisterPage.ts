import { Page, expect } from '@playwright/test';

export class RegisterPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/register', { waitUntil: 'networkidle' });
    await expect(this.page.getByText(/création de compte/i)).toBeVisible();
  }

  get firstname() { return this.page.getByLabel(/prénom/i); }
  get lastname()  { return this.page.getByLabel(/nom/i); }
  get email()     { return this.page.getByLabel(/email/i); }
  get phone()     { return this.page.getByLabel(/numéro de téléphone/i); }
  get password()  { return this.page.getByLabel(/mot de passe/i); }
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
