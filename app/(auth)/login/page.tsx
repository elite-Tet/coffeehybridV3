'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import AuthShell from '@/features/auth/AuthShell';
import AuthField from '@/features/auth/AuthField';
import { safeCallbackUrl } from '@/features/auth/safe-callback';
import { boardButtonGhost, boardButtonPrimary } from '@/components/layout/board-styles';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));
    // Auth.js sends people back here with ?error=… when Google sign-in fails.
    const providerError = searchParams.get('error');
    const [email, setEmail] = useState(searchParams.get('email') ?? '');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState(
        providerError ? 'Google sign-in didn’t work. Try again, or use your email and password.' : ''
    );

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setLoading(true);
        try {
            const res = await signIn('credentials', { redirect: false, email, password, callbackUrl });
            if (res?.error) {
                setFormError('That email and password don’t match. Check them and try again.');
            } else {
                toast.success('Signed in');
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            setFormError('We couldn’t reach the shop. Check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await signIn('google', { callbackUrl });
        } catch {
            setFormError('Google sign-in didn’t work. Try again, or use your email and password.');
            setLoading(false);
        }
    };

    const registerHref = callbackUrl === '/' ? '/register' : `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`;

    return (
        <AuthShell
            title="Sign in"
            lede="Pick up where you left off: your cart and orders are waiting."
            footer={<>New here? <Link href={registerHref} className="font-bold text-signal underline underline-offset-4">Create an account</Link></>}
        >
            <form onSubmit={handleCredentialsLogin} className="grid gap-4">
                {formError && (
                    <p role="alert" className="rounded-sm border-2 border-destructive/60 bg-destructive/10 p-3 font-bold text-destructive">
                        {formError}
                    </p>
                )}
                <AuthField
                    id="email"
                    label="Email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    suppressHydrationWarning
                />
                <AuthField
                    id="password"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    suppressHydrationWarning
                />
                <button type="submit" className={`${boardButtonPrimary} mt-2 w-full disabled:opacity-60`} disabled={loading}>
                    {loading ? (<><Loader2 className="size-5 animate-spin" aria-hidden="true" /> Signing in…</>) : 'Sign in'}
                </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-sm text-muted-foreground" aria-hidden="true">
                <span className="h-0.5 flex-1 bg-slat" />or<span className="h-0.5 flex-1 bg-slat" />
            </div>

            <button type="button" onClick={handleGoogleLogin} disabled={loading} className={`${boardButtonGhost} w-full disabled:opacity-60`}>
                Continue with Google
            </button>
        </AuthShell>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center" role="status"><Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" /><span className="sr-only">Loading</span></div>}>
            <LoginForm />
        </Suspense>
    );
}
