'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        // Direction C is dark-only. Forcing the theme keeps shadcn `dark:` variants and the toaster in sync.
        <NextThemesProvider attribute="class" forcedTheme="dark" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            {children}
        </NextThemesProvider>
    );
}
