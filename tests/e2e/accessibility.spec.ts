import { test, expect } from '@playwright/test';
import { accounts, axe, hasAccounts, signIn } from './helpers';

test.use({ reducedMotion: 'reduce' });

async function checkPage(page: import('@playwright/test').Page) {
    await page.waitForLoadState('load');
    await page.waitForTimeout(1500); // client-fetched content (menu, orders)
    expect(await axe(page), 'axe WCAG 2.2 AA violations').toEqual([]);

    const layout = await page.evaluate(() => ({
        horizontalScroll: document.documentElement.scrollWidth > innerWidth + 1,
        h1Count: document.querySelectorAll('h1').length,
        mainCount: document.querySelectorAll('main').length,
        skipLink: Boolean(document.querySelector('a[href="#main"]')),
    }));
    expect(layout).toEqual({ horizontalScroll: false, h1Count: 1, mainCount: 1, skipLink: true });
}

for (const route of ['/', '/menu', '/login', '/register']) {
    test(`public ${route} passes axe and layout checks`, async ({ page }) => {
        await page.goto(route);
        await checkPage(page);
    });
}

test.describe('signed in', () => {
    test.skip(!hasAccounts, 'set E2E_CUSTOMER_EMAIL / E2E_ADMIN_EMAIL / E2E_PASSWORD');

    for (const route of ['/checkout', '/history']) {
        test(`customer ${route} passes axe and layout checks`, async ({ page }) => {
            await signIn(page, accounts.customer!);
            await page.goto(route);
            await checkPage(page);
        });
    }

    for (const route of ['/staff', '/staff/scan', '/admin', '/admin/products', '/admin/categories', '/admin/orders']) {
        test(`staff/admin ${route} passes axe and layout checks`, async ({ page }) => {
            await signIn(page, accounts.admin!);
            await page.goto(route);
            await checkPage(page);
        });
    }
});
