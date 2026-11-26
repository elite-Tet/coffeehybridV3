'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

const OPTIONS = [
    { value: 'system', label: 'System', icon: Monitor },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
] as const;

/** Segmented System / Light / Dark control. */
export default function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    // false during SSR, true in the browser: avoids a theme mismatch on hydration.
    const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

    return (
        <div role="radiogroup" aria-label="Appearance" className={cn('inline-flex rounded-full bg-muted p-1', className)}>
            {OPTIONS.map(({ value, label, icon: Icon }) => {
                const active = mounted && theme === value;
                return (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setTheme(value)}
                        className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
                            active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Icon className="size-4" aria-hidden="true" />
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
