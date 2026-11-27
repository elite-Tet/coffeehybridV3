import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/unit/setup.ts'],
        // Unit tests only; browser tests in tests/e2e/ run with Playwright (npm run test:e2e).
        include: ['tests/unit/**/*.test.{ts,tsx}'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
});
