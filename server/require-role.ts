import { NextResponse } from 'next/server';
import type { Session } from 'next-auth';
import { auth } from '@/server/auth';
import type { Role } from '@/types';

type RoleCheck =
    | { ok: true; session: Session }
    | { ok: false; response: NextResponse };

/**
 * Guard for API route handlers. `/api` is excluded from proxy.ts,
 * so every mutating route must check the caller's role itself.
 *
 *   const check = await requireRole(['admin']);
 *   if (!check.ok) return check.response;
 */
export async function requireRole(roles: Role[]): Promise<RoleCheck> {
    const session = await auth();

    if (!session?.user) {
        return {
            ok: false,
            response: NextResponse.json({ success: false, error: 'Sign in required' }, { status: 401 }),
        };
    }

    if (!roles.includes(session.user.role)) {
        return {
            ok: false,
            response: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }),
        };
    }

    return { ok: true, session };
}
