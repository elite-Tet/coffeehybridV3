import { test, expect } from '@playwright/test';

test.describe('keyboard', () => {
    test.skip(({ isMobile }) => isMobile, 'keyboard journey is a desktop concern');

    test('skip link moves focus to main content', async ({ page }) => {
        await page.goto('/menu');
        await page.keyboard.press('Tab');
        const skip = page.getByRole('link', { name: 'Skip to content' });
        await expect(skip).toBeFocused();
        await expect(skip).toBeVisible();
        await page.keyboard.press('Enter');
        await expect(page.locator('main#main')).toBeFocused();
    });

    test('product sheet traps focus and returns it on Escape', async ({ page }) => {
        await page.goto('/menu');
        const opener = page.getByRole('button', { name: /^Customize Cappuccino/ });
        await opener.focus();
        await page.keyboard.press('Enter');
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        for (let i = 0; i < 20; i++) await page.keyboard.press('Tab');
        expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
        await expect(opener).toBeFocused();
    });

    test('pickup board pause is operable with the keyboard', async ({ page }) => {
        await page.goto('/');
        const pause = page.getByRole('button', { name: /^(Pause|Play)$/ });
        const before = await pause.getAttribute('aria-pressed');
        await pause.focus();
        await page.keyboard.press('Space');
        await expect(pause).not.toHaveAttribute('aria-pressed', before ?? '');
    });
});
