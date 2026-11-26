'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/features/cart/cart.store';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { describeCustomizations } from '@/features/orders/order-status';
import { cn } from '@/lib/utils';
import { boardButtonPrimary } from '@/components/layout/board-styles';

export default function CartDrawer({ children, side = 'right' }: { children: React.ReactNode; side?: 'right' | 'bottom' }) {
    const { items, removeItem, updateQuantity, getTotal } = useCartStore();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const count = items.reduce((a, i) => a + i.quantity, 0);

    const go = (href: string) => {
        setOpen(false);
        router.push(href);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent
                side={side}
                className={cn('flex flex-col gap-0 border-0 bg-panel p-0', side === 'bottom' ? 'max-h-[88dvh] rounded-t-2xl' : 'w-full sm:max-w-md')}
            >
                <SheetHeader className="border-b-2 border-slat px-5 py-4 text-left">
                    <SheetTitle className="display text-[2rem] leading-none">Your order</SheetTitle>
                    <SheetDescription>{count === 0 ? 'Nothing here yet.' : `${count} ${count === 1 ? 'drink' : 'drinks'}`}</SheetDescription>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                        <p className="display text-[1.75rem]">Your cart is empty</p>
                        <p className="text-muted-foreground">Pick a drink from the menu to get started.</p>
                        <button type="button" onClick={() => go('/menu')} className={`${boardButtonPrimary} mt-2`}>
                            Browse the menu
                        </button>
                    </div>
                ) : (
                    <>
                        <ul className="flex-1 divide-y-2 divide-slat overflow-y-auto overscroll-contain px-5">
                            {items.map((item, index) => (
                                <li key={index} className="flex gap-3 py-4">
                                    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-slat">
                                        <Image src={item.productImage} alt="" fill sizes="64px" className="object-cover" unoptimized />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <p className="display text-[1.375rem] leading-tight">{item.productName}</p>
                                            <p className="font-bold tabular-nums">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{describeCustomizations(item.customizations)}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex items-center rounded-sm bg-slat" role="group" aria-label={`Quantity of ${item.productName}`}>
                                                <button
                                                    type="button"
                                                    className="flex size-11 items-center justify-center rounded-sm"
                                                    onClick={() => (item.quantity === 1 ? removeItem(index) : updateQuantity(index, item.quantity - 1))}
                                                    aria-label={item.quantity === 1 ? `Remove ${item.productName}` : `One less ${item.productName}`}
                                                >
                                                    {item.quantity === 1 ? <Trash2 className="size-4" aria-hidden="true" /> : <Minus className="size-4" aria-hidden="true" />}
                                                </button>
                                                <span className="w-6 text-center font-bold tabular-nums">{item.quantity}</span>
                                                <button type="button" className="flex size-11 items-center justify-center rounded-sm" onClick={() => updateQuantity(index, item.quantity + 1)} aria-label={`One more ${item.productName}`}>
                                                    <Plus className="size-4" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="space-y-3 border-t-2 border-slat px-5 pt-4 pb-5 safe-bottom">
                            <div className="flex items-baseline justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="text-lg font-bold tabular-nums">${getTotal().toFixed(2)}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => go('/checkout')}
                                className={`${boardButtonPrimary} w-full justify-between`}
                            >
                                <span>Checkout</span>
                                <span className="tabular-nums">${getTotal().toFixed(2)}</span>
                            </button>
                            <button type="button" onClick={() => setOpen(false)} className="min-h-11 w-full text-muted-foreground hover:text-foreground">
                                Keep browsing
                            </button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
