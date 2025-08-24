// tests/utils/network.ts
import { Page, Route } from '@playwright/test';
import { readFile } from 'fs/promises';
import path from 'path';

function fixturePath(file: string) {
  return path.resolve(process.cwd(), 'tests', 'fixtures', file);
}

export async function mockUserAndInterventions(page: Page) {
  // Regex agnostiques de la base d’URL (localhost, 127.0.0.1, /api, etc.)
  await page.route(/\/users\/me\/?(\?.*)?$/, async (route: Route) => {
    const body = await readFile(fixturePath('user.me.json'), 'utf-8');
    await route.fulfill({ status: 200, contentType: 'application/json', body });
  });

  await page.route(/\/interventions\/client\/?(\?.*)?$/, async (route: Route) => {
    const body = await readFile(fixturePath('interventions.client.json'), 'utf-8');
    await route.fulfill({ status: 200, contentType: 'application/json', body });
  });
}

export async function mockInterventionsEmpty(page: Page) {
  await page.route(/\/interventions\/client\/?(\?.*)?$/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  );
}
