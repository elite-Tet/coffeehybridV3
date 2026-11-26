'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/features/cart/cart.store';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { describeCustomizations } from '@/features/orders/order-status';
import { cn } from '@/lib/utils';

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
                className={cn('flex flex-col gap-0 p-0', side === 'bottom' ? 'max-h-[88dvh] rounded-t-3xl' : 'w-full sm:max-w-md')}
            >
                <SheetHeader className="border-b px-5 py-4 text-left">
                    <SheetTitle className="display text-2xl font-semibold">Your order</SheetTitle>
                    <SheetDescription>{count === 0 ? 'Nothing here yet.' : `${count} ${count === 1 ? 'drink' : 'drinks'}`}</SheetDescription>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                        <p className="text-lg font-medium">Your cart is empty</p>
                        <p className="text-muted-foreground">Pick a drink from the menu to get started.</p>
                        <button type="button" onClick={() => go('/menu')} className="mt-2 rounded-full bg-primary px-5 py-2.5 text-primary-foreground">
                            Browse the menu
                        </button>
                    </div>
                ) : (
                    <>
                        <ul className="flex-1 divide-y overflow-y-auto overscroll-contain px-5">
                            {items.map((item, index) => (
                                <li key={index} className="flex gap-3 py-4">
                                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                                        <Image src={item.productImage} alt="" fill sizes="64px" className="object-cover" unoptimized />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <p className="font-medium">{item.productName}</p>
                                            <p className="tabular-nums">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{describeCustomizations(item.customizations)}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex items-center rounded-full border" role="group" aria-label={`Quantity of ${item.productName}`}>
                                                <button
                                                    type="button"
                                                    className="flex size-9 items-center justify-center rounded-full"
                                                    onClick={() => (item.quantity === 1 ? removeItem(index) : updateQuantity(index, item.quantity - 1))}
                                                    aria-label={item.quantity === 1 ? `Remove ${item.productName}` : 'One less'}
                                                >
                                                    {item.quantity === 1 ? <Trash2 className="size-4" aria-hidden="true" /> : <Minus className="size-4" aria-hidden="true" />}
                                                </button>
                                                <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                                                <button type="button" className="flex size-9 items-center justify-center rounded-full" onClick={() => updateQuantity(index, item.quantity + 1)} aria-label="One more">
                                                    <Plus className="size-4" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="space-y-3 border-t px-5 pt-4 pb-5 safe-bottom">
                            <div className="flex items-baseline justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="text-lg font-medium tabular-nums">${getTotal().toFixed(2)}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => go('/checkout')}
                                className="flex h-12 w-full items-center justify-between rounded-full bg-primary px-5 font-medium text-primary-foreground"
                            >
                                <span>Checkout</span>
                                <span className="tabular-nums">${getTotal().toFixed(2)}</span>
                            </button>
                            <button type="button" onClick={() => setOpen(false)} className="w-full py-2 text-sm text-muted-foreground hover:text-foreground">
                                Keep browsing
                            </button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
