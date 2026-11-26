'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { LayoutDashboard, LogOut, ScanLine } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import StrikeDots from '@/features/orders/StrikeDots';
import { ExtendedUser } from '@/types';
import { isSuspended } from '@/lib/strikes';

export default function AccountSheet({ children, side = 'right' }: { children: React.ReactNode; side?: 'right' | 'bottom' }) {
    const { data: session } = useSession();
    const user = session?.user as ExtendedUser | undefined;
    if (!user) return null;

    const paused = isSuspended(user.suspendedUntil);

    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent side={side} className={side === 'bottom' ? 'rounded-t-2xl bg-panel safe-bottom' : 'w-full bg-panel sm:max-w-sm'}>
                <SheetHeader className="text-left">
                    <SheetTitle className="display text-[2rem]">{user.name || 'Your account'}</SheetTitle>
                    <SheetDescription>{user.email}</SheetDescription>
                </SheetHeader>

                <div className="space-y-6 px-4 pb-6">
                    <section aria-labelledby="pickup-record" className="space-y-2 rounded-xl bg-slat p-4">
                        <h2 id="pickup-record" className="display text-xl">Pickup record</h2>
                        <StrikeDots strikes={user.strikes ?? 0} />
                        <p className="text-sm text-muted-foreground">
                            {paused
                                ? `Ordering is paused until ${new Date(user.suspendedUntil!).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}. You can still browse the menu.`
                                : 'We hold each order for 30 minutes. Three missed pickups pause ordering for 24 hours.'}
                        </p>
                    </section>

                    {(user.role === 'staff' || user.role === 'admin') && (
                        <nav aria-label="Workspace" className="grid gap-2">
                            <Button asChild variant="outline" className="h-11 justify-start rounded-sm">
                                <Link href="/staff"><ScanLine aria-hidden="true" /> Staff order board</Link>
                            </Button>
                            {user.role === 'admin' && (
                                <Button asChild variant="outline" className="h-11 justify-start rounded-sm">
                                    <Link href="/admin"><LayoutDashboard aria-hidden="true" /> Admin</Link>
                                </Button>
                            )}
                        </nav>
                    )}

                    <Button variant="ghost" className="h-11 w-full justify-start rounded-sm text-destructive hover:text-destructive" onClick={() => signOut({ callbackUrl: '/' })}>
                        <LogOut aria-hidden="true" /> Sign out
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
