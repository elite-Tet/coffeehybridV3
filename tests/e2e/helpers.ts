import { readFileSync } from 'node:fs';
import { expect, type Page } from '@playwright/test';

export const accounts = {
    customer: process.env.E2E_CUSTOMER_EMAIL,
    admin: process.env.E2E_ADMIN_EMAIL,
    password: process.env.E2E_PASSWORD,
};
export const hasAccounts = Boolean(accounts.customer && accounts.admin && accounts.password);

export async function signIn(page: Page, email: string) {
    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill(accounts.password!);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page).not.toHaveURL(/\/login/);
}

// axe-core ships with eslint-config-next (via eslint-plugin-jsx-a11y); inject it into the page.
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

export type AxeViolation = { id: string; impact: string | null; help: string; targets: string[] };

/** Run axe with WCAG 2.0–2.2 A/AA rules and return violations (empty array = pass). */
export async function axe(page: Page): Promise<AxeViolation[]> {
    await page.addScriptTag({ content: axeSource });
    return page.evaluate(async () => {
        const w = window as unknown as { axe: { run: (ctx: Document, opts: object) => Promise<{ violations: { id: string; impact: string | null; help: string; nodes: { target: string[] }[] }[] }> } };
        const result = await w.axe.run(document, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
        });
        return result.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, targets: v.nodes.map((n) => n.target.join(' ')) }));
    });
}
