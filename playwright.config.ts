import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests for the customer journey, keyboard access and WCAG checks.
 *
 *   npm run build && npm run test:e2e
 *
 * Runs against a production server on :3000 (NEXTAUTH_URL points there, so auth
 * redirects only work on that port). Uses your installed Chrome — no browser download.
 * Signed-in tests need E2E_CUSTOMER_EMAIL / E2E_ADMIN_EMAIL / E2E_PASSWORD (see .env.example);
 * without them those tests are skipped, the rest still run.
 */
export default defineConfig({
    testDir: './tests/e2e',
    timeout: 60_000,
    fullyParallel: false, // tests share one database; keep them predictable
    reporter: [['list']],
    use: {
        baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
        channel: 'chrome',
        trace: 'retain-on-failure',
    },
    projects: [
        { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 900 } } },
        { name: 'phone', use: { ...devices['Pixel 7'], channel: 'chrome', viewport: { width: 390, height: 844 } } },
    ],
    webServer: {
        command: 'npm run start -- -p 3000',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
    },
});
