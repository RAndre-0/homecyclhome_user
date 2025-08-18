import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  retries: 1,
  expect: { timeout: 5_000 },
  use: {
    baseURL: 'http://127.0.0.1:3000',   // ← URL de test
    trace: 'on-first-retry',
  },
  webServer: {
    // Démarre Next en dev, sans certificat ni HTTPS
    command: 'npx next dev -p 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: true,
    timeout: 180_000,                    // le premier build peut être un peu long
    env: { NODE_ENV: 'development' },    // ← cookie NON secure (OK en HTTP pour les tests)
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});
