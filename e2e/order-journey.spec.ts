import { test, expect } from '@playwright/test';
import { accounts, hasAccounts, signIn } from './helpers';

test('menu: customize a drink, price updates, cart totals add up', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: /^Customize Matcha Green Tea Latte/ }).click();
    const sheet = page.getByRole('dialog');
    await sheet.locator('label', { hasText: 'Grande' }).click();
    await sheet.getByText('Oat Milk').click();
    await sheet.getByRole('button', { name: 'One more' }).click();
    // 4.95 + 0.75 (Grande) + 0.60 (Oat Milk) = 6.30, × 2
    await expect(sheet.getByRole('button', { name: /Add to order/ })).toContainText('$12.60');
    await sheet.getByRole('button', { name: /Add to order/ }).click();
    await page.getByRole('button', { name: 'Add Espresso with default options' }).click();
    await expect(page.getByText('Single, No Sugar, Hot').first()).toBeVisible(); // toast copy, no doubled words
});

test('checkout requires sign-in and keeps you on the site', async ({ page }) => {
    await page.goto('/login?callbackUrl=https%3A%2F%2Fexample.com');
    await expect(page.getByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible();
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fcheckout/);
});

test.describe('signed in', () => {
    test.skip(!hasAccounts, 'set E2E_CUSTOMER_EMAIL / E2E_ADMIN_EMAIL / E2E_PASSWORD');
    test.skip(({ isMobile }) => isMobile, 'places a real order; run once (desktop)');

    test('place an order, see the ticket, staff picks it up by typed code', async ({ page, browser }) => {
        await signIn(page, accounts.customer!);
        await page.goto('/menu');
        await page.getByRole('button', { name: 'Add Americano with default options' }).click();
        await page.goto('/checkout');
        await page.getByRole('button', { name: /Place order/ }).click();
        await expect(page).toHaveURL(/\/order\/[a-f0-9]{24}$/);
        await expect(page.getByText('Show this code at the counter.')).toBeVisible();
        const code = (await page.getByLabel(/^Order number /).textContent())!.trim();
        expect(code).toMatch(/^[0-9A-F]{4}$/);

        const staff = await (await browser.newContext()).newPage();
        await signIn(staff, accounts.admin!);
        await staff.goto('/staff/scan');
        await staff.getByLabel('Order code').fill(code);
        await staff.getByRole('button', { name: 'Check code' }).click();
        await expect(staff.getByText('Verified', { exact: false }).first()).toBeVisible();

        await page.reload();
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Enjoy your coffee');
    });
});
