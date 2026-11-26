'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { boardButtonGhost, boardButtonPrimary } from '@/components/layout/board-styles';

/**
 * Hero calls to action, which depend on who is looking:
 * signed out → Sign in, staff/admin → Open workspace.
 * Returning customers skip the pitch and go straight to the menu (existing behaviour).
 */
export default function HeroActions() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const role = session?.user?.role;

    useEffect(() => {
        if (role === 'customer') router.replace('/menu');
    }, [role, router]);

    return (
        <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/menu" className={boardButtonPrimary}>Start an order</Link>
            {status === 'unauthenticated' && (
                <Link href="/login" className={boardButtonGhost}>Sign in</Link>
            )}
            {role === 'staff' || role === 'admin' ? (
                <Link href={role === 'admin' ? '/admin' : '/staff'} className={boardButtonGhost}>Open workspace</Link>
            ) : null}
        </div>
    );
}
