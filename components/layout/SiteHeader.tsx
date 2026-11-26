'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/features/cart/cart.store';
import CartDrawer from '@/features/cart/CartDrawer';
import AccountSheet from '@/components/layout/AccountSheet';
import Logo from '@/components/layout/Logo';
import { cn } from '@/lib/utils';
import { boardButtonPrimary } from '@/components/layout/board-styles';

export default function SiteHeader() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const cartCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
    const isLoggedIn = status === 'authenticated';

    const links = [
        { href: '/menu', label: 'Menu' },
        { href: '/#how-it-works', label: 'How pickup works' },
        ...(isLoggedIn ? [{ href: '/history', label: 'Your orders' }] : []),
    ];

    return (
        <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 md:h-[72px] md:px-12">
                <Logo />

                <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
                    {links.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'inline-flex min-h-11 items-center text-base transition-colors',
                                    active ? 'text-foreground underline decoration-signal decoration-2 underline-offset-8' : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                    {!isLoggedIn && status !== 'loading' && (
                        <Link href="/login" className="inline-flex min-h-11 items-center text-base text-muted-foreground transition-colors hover:text-foreground">
                            Sign in
                        </Link>
                    )}
                </nav>

                <div className="ml-auto hidden items-center gap-3 md:flex">
                    <CartDrawer>
                        <button
                            type="button"
                            className="inline-flex min-h-11 items-center gap-2 rounded-sm px-3 text-muted-foreground transition-colors hover:bg-panel hover:text-foreground"
                            aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
                        >
                            <ShoppingBag className="size-5" aria-hidden="true" />
                            <span className="tabular-nums">{cartCount}</span>
                        </button>
                    </CartDrawer>

                    {isLoggedIn && (
                        <AccountSheet>
                            <button
                                type="button"
                                className="display flex size-11 items-center justify-center rounded-sm bg-panel text-xl text-foreground transition-colors hover:bg-slat"
                                aria-label="Account"
                            >
                                {(session.user?.name || session.user?.email || '?').charAt(0).toUpperCase()}
                            </button>
                        </AccountSheet>
                    )}

                    <Link href="/menu" className={boardButtonPrimary}>
                        Start an order
                    </Link>
                </div>

                {!isLoggedIn && status !== 'loading' && (
                    <Link href="/login" className="ml-auto inline-flex min-h-11 items-center text-base text-muted-foreground md:hidden">
                        Sign in
                    </Link>
                )}
            </div>
        </header>
    );
}
