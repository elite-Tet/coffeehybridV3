'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Coffee, Receipt, ShoppingBag, UserRound } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import CartDrawer from '@/components/cart/CartDrawer';
import AccountSheet from '@/components/shared/AccountSheet';
import { cn } from '@/lib/utils';

const tab = 'flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-xs min-h-11';

/** Phone-only tab bar: Menu, Orders, Cart, Account. */
export default function BottomTabBar() {
    const pathname = usePathname();
    const { status } = useSession();
    const cartCount = useCartStore((s) => s.items.reduce((acc, i) => acc + i.quantity, 0));
    const loggedIn = status === 'authenticated';

    const item = (active: boolean) => cn(tab, active ? 'text-foreground font-medium' : 'text-muted-foreground');

    return (
        <nav
            aria-label="Main"
            className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-sm safe-bottom md:hidden"
        >
            <div className="mx-auto flex max-w-md items-stretch px-2 pt-1">
                <Link href="/menu" className={item(pathname === '/menu' || pathname === '/')} aria-current={pathname === '/menu' ? 'page' : undefined}>
                    <Coffee className="size-5" aria-hidden="true" />
                    Menu
                </Link>
                <Link href="/history" className={item(pathname === '/history' || pathname.startsWith('/order'))} aria-current={pathname === '/history' ? 'page' : undefined}>
                    <Receipt className="size-5" aria-hidden="true" />
                    Orders
                </Link>
                <CartDrawer side="bottom">
                    <button type="button" className={cn(item(false), 'relative')}>
                        <span className="relative">
                            <ShoppingBag className="size-5" aria-hidden="true" />
                            {cartCount > 0 && (
                                <span aria-hidden="true" className="absolute -right-2.5 -top-1.5 min-w-4 rounded-full bg-primary px-1 text-center text-[11px] font-semibold leading-4 text-primary-foreground">
                                    {cartCount}
                                </span>
                            )}
                        </span>
                        Cart
                        <span className="sr-only">, {cartCount} {cartCount === 1 ? "item" : "items"}</span>
                    </button>
                </CartDrawer>
                {loggedIn ? (
                    <AccountSheet side="bottom">
                        <button type="button" className={item(false)}>
                            <UserRound className="size-5" aria-hidden="true" />
                            Account
                        </button>
                    </AccountSheet>
                ) : (
                    <Link href="/login" className={item(pathname === '/login')}>
                        <UserRound className="size-5" aria-hidden="true" />
                        Sign in
                    </Link>
                )}
            </div>
        </nav>
    );
}
