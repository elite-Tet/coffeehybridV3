'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AuthShell from '@/features/auth/AuthShell';
import AuthField from '@/features/auth/AuthField';
import { safeCallbackUrl } from '@/features/auth/safe-callback';
import { boardButtonPrimary } from '@/components/layout/board-styles';
import { registerSchema } from '@/lib/validations/user.schema';

type Field = 'name' | 'email' | 'password' | 'confirmPassword';

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
    const [formError, setFormError] = useState('');

    const set = (field: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [field]: e.target.value });
        if (errors[field]) setErrors({ ...errors, [field]: undefined });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        // Same schema the API uses, so the rules (e.g. 8+ character password) live in one place.
        const parsed = registerSchema.safeParse(formData);
        const next: Partial<Record<Field, string>> = {};
        if (!parsed.success) {
            for (const issue of parsed.error.issues) {
                const key = issue.path[0] as Field;
                if (!next[key]) next[key] = issue.message;
            }
        }
        if (formData.password && formData.password !== formData.confirmPassword) {
            next.confirmPassword = 'The two passwords don’t match.';
        }
        setErrors(next);
        if (Object.keys(next).length > 0) {
            const first = (['name', 'email', 'password', 'confirmPassword'] as Field[]).find((f) => next[f]);
            if (first) document.getElementById(first)?.focus();
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setFormError(
                    res.status === 503
                        ? 'We couldn’t reach the shop’s database. Try again in a minute.'
                        : data.message === 'User already exists'
                          ? 'There’s already an account with that email. Sign in instead.'
                          : data.message || 'We couldn’t create your account. Try again.'
                );
                return;
            }
            toast.success('Account created. Sign in to start ordering.');
            const params = new URLSearchParams({ email: formData.email.trim() });
            if (callbackUrl !== '/') params.set('callbackUrl', callbackUrl);
            router.push(`/login?${params}`);
        } catch {
            setFormError('We couldn’t reach the shop. Check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="Create an account"
            lede="Order ahead, get a pickup code, skip the line."
            footer={<>Already have an account? <Link href="/login" className="font-bold text-signal underline underline-offset-4">Sign in</Link></>}
        >
            <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
                {formError && (
                    <p role="alert" className="rounded-sm border-2 border-destructive/60 bg-destructive/10 p-3 font-bold text-destructive">
                        {formError}
                    </p>
                )}
                <AuthField id="name" label="Name" autoComplete="name" required value={formData.name} onChange={set('name')} error={errors.name} disabled={loading} />
                <AuthField id="email" label="Email" type="email" autoComplete="email" inputMode="email" required value={formData.email} onChange={set('email')} error={errors.email} disabled={loading} />
                <AuthField
                    id="password"
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    hint="At least 8 characters."
                    value={formData.password}
                    onChange={set('password')}
                    error={errors.password}
                    disabled={loading}
                />
                <AuthField id="confirmPassword" label="Confirm password" type="password" autoComplete="new-password" required value={formData.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} disabled={loading} />
                <button type="submit" className={`${boardButtonPrimary} mt-2 w-full disabled:opacity-60`} disabled={loading}>
                    {loading ? (<><Loader2 className="size-5 animate-spin" aria-hidden="true" /> Creating account…</>) : 'Create account'}
                </button>
            </form>
        </AuthShell>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center" role="status"><Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" /><span className="sr-only">Loading</span></div>}>
            <RegisterForm />
        </Suspense>
    );
}
