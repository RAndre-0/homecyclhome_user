import { Page } from '@playwright/test';


export async function freezeTime(page: Page, iso = '2025-03-10T10:00:00.000Z') {
await page.addInitScript((fixedNow) => {
// @ts-ignore
const OriginalDate = Date;
// @ts-ignore
class MockDate extends OriginalDate {
constructor(...args: any[]) {
if (args.length === 0) {
super(fixedNow);
} else {
super(...args as [any]);
}
}
static now() { return new OriginalDate(fixedNow).getTime(); }
}
// @ts-ignore
window.Date = MockDate;
}, iso);
}


/** Place le cookie JWT `hch_token_u` sur l’origin du baseURL */
export async function setUserJwtCookie(page: Page, jwt?: string) {
  const token = jwt || process.env.PW_JWT || 'dummy.jwt.for.tests';
  const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';
  const { origin } = new URL(base);
  await page.context().addCookies([{ name: 'hch_token_u', value: token, url: origin }]);
}