'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/features/cart/cart.store';
import CartDrawer from '@/features/cart/CartDrawer';
import AccountSheet from '@/components/layout/AccountSheet';
import Logo from '@/components/layout/Logo';
import { cn } from '@/lib/utils';

export default function SiteHeader() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const cartCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
    const isLoggedIn = status === 'authenticated';

    const links = [
        { href: '/menu', label: 'Menu' },
        ...(isLoggedIn ? [{ href: '/history', label: 'Orders' }] : []),
    ];

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85">
            <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 md:h-16 md:px-6">
                <Logo />

                <nav aria-label="Main" className="hidden md:flex items-center gap-1">
                    {links.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'rounded-full px-3 py-1.5 text-sm transition-colors',
                                    active ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="ml-auto hidden md:flex items-center gap-2">
                    <CartDrawer>
                        <Button variant="ghost" className="relative gap-2 rounded-full" aria-label={`Cart, ${cartCount} items`}>
                            <ShoppingBag className="size-5" aria-hidden="true" />
                            <span className="tabular-nums">{cartCount}</span>
                        </Button>
                    </CartDrawer>

                    {isLoggedIn ? (
                        <AccountSheet>
                            <button
                                type="button"
                                className="flex size-9 items-center justify-center rounded-full bg-kraft text-sm font-semibold text-kraft-foreground"
                                aria-label="Account"
                            >
                                {(session.user?.name || session.user?.email || '?').charAt(0).toUpperCase()}
                            </button>
                        </AccountSheet>
                    ) : (
                        <>
                            <Button variant="ghost" asChild className="rounded-full">
                                <Link href="/login">Sign in</Link>
                            </Button>
                            <Button asChild className="rounded-full px-5">
                                <Link href="/menu">Start an order</Link>
                            </Button>
                        </>
                    )}
                </div>

                {!isLoggedIn && status !== 'loading' && (
                    <Link href="/login" className="ml-auto text-sm font-medium md:hidden">
                        Sign in
                    </Link>
                )}
            </div>
        </header>
    );
}
