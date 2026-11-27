import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        // Unit tests are pure logic and Mongoose model validation, so they run in Node (no DOM).
        // Add jsdom + @testing-library back when you start writing component tests.
        environment: 'node',
        globals: true,
        // Browser tests in tests/e2e/ run with Playwright (npm run test:e2e).
        include: ['tests/unit/**/*.test.{ts,tsx}'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
});
