import { cn } from '@/lib/utils';

type AuthFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    id: string;
    label: string;
    hint?: string;
    error?: string;
};

/**
 * Label + input + optional hint + inline error, wired for screen readers:
 * the hint and error are linked with aria-describedby, and aria-invalid marks the field.
 */
export default function AuthField({ id, label, hint, error, className, ...input }: AuthFieldProps) {
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;

    return (
        <div className="grid gap-1.5">
            <label htmlFor={id} className="font-bold">{label}</label>
            <input
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
                className={cn(
                    'h-12 w-full rounded-sm border border-input bg-roast px-3 text-base text-foreground transition-colors placeholder:text-muted-foreground/70 focus-visible:border-signal disabled:opacity-60',
                    error && 'border-destructive',
                    className
                )}
                {...input}
            />
            {hint && <p id={hintId} className="text-sm text-muted-foreground">{hint}</p>}
            {error && <p id={errorId} className="text-sm font-bold text-destructive">{error}</p>}
        </div>
    );
}
