'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Loader2, Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/store/cart.store';
import { ExtendedUser } from '@/types';
import { isSuspended } from '@/lib/strikes';
import { describeCustomizations } from '@/lib/order-status';
import StrikeDots from '@/components/order/StrikeDots';

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { items, getTotal, clearCart, removeItem, updateQuantity } = useCartStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login?callbackUrl=/checkout');
    }, [status, router]);

    if (status !== 'authenticated') {
        return (
            <div className="flex h-[60vh] items-center justify-center" role="status">
                <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Loading checkout</span>
            </div>
        );
    }

    const user = session.user as ExtendedUser;
    const paused = isSuspended(user.suspendedUntil);
    const pausedUntil = paused ? new Date(user.suspendedUntil!).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
    const total = getTotal();

    if (items.length === 0) {
        return (
            <div className="mx-auto max-w-md px-4 py-20 text-center">
                <h1 className="display text-3xl font-semibold">Your cart is empty</h1>
                <p className="mt-2 text-muted-foreground">Pick a drink from the menu, then come back here to place your order.</p>
                <Link href="/menu" className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-6 font-medium text-primary-foreground">
                    Browse the menu
                </Link>
            </div>
        );
    }

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items, subtotal: total, total }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Order placed. We’re on it.');
                clearCart();
                router.push(`/order/${data.data._id}`);
            } else {
                toast.error(data.error || 'Couldn’t place your order. Something may have sold out — check your items.');
                setIsSubmitting(false);
            }
        } catch {
            toast.error('Couldn’t reach the shop. Check your connection and try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-5xl px-4 pt-6 md:px-6 md:pt-10">
            <Link href="/menu" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" aria-hidden="true" /> Back to menu
            </Link>
            <h1 className="display mt-3 text-4xl font-semibold">Review your order</h1>

            <div className="mt-8 grid gap-6 md:grid-cols-[1fr_22rem] md:items-start">
                <section aria-labelledby="items-title" className="rounded-3xl border bg-card">
                    <h2 id="items-title" className="px-5 pt-5 text-lg font-medium">Your items</h2>
                    <ul className="divide-y px-5">
                        {items.map((item, idx) => (
                            <li key={idx} className="flex gap-3 py-4">
                                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                                    <Image src={item.productImage} alt="" fill sizes="64px" className="object-cover" unoptimized />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <p className="font-medium">{item.productName}</p>
                                        <p className="tabular-nums">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{describeCustomizations(item.customizations)}</p>
                                    <div className="mt-2 flex items-center rounded-full border w-fit" role="group" aria-label={`Quantity of ${item.productName}`}>
                                        <button
                                            type="button"
                                            className="flex size-9 items-center justify-center rounded-full"
                                            onClick={() => (item.quantity === 1 ? removeItem(idx) : updateQuantity(idx, item.quantity - 1))}
                                            aria-label={item.quantity === 1 ? `Remove ${item.productName}` : 'One less'}
                                        >
                                            {item.quantity === 1 ? <Trash2 className="size-4" aria-hidden="true" /> : <Minus className="size-4" aria-hidden="true" />}
                                        </button>
                                        <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                                        <button type="button" className="flex size-9 items-center justify-center rounded-full" onClick={() => updateQuantity(idx, item.quantity + 1)} aria-label="One more">
                                            <Plus className="size-4" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <aside className="space-y-4 md:sticky md:top-24">
                    {paused ? (
                        <section className="rounded-3xl border border-st-expired/40 bg-st-expired/10 p-5" aria-labelledby="paused-title">
                            <h2 id="paused-title" className="flex items-center gap-2 font-medium">
                                <AlertCircle className="size-5 text-st-expired" aria-hidden="true" />
                                Ordering is paused until {pausedUntil}
                            </h2>
                            <p className="mt-2 text-sm">Three orders weren’t picked up in time. Your cart is saved, so you can place it once the pause ends.</p>
                            <StrikeDots strikes={user.strikes ?? 3} className="mt-3" />
                        </section>
                    ) : (
                        <section className="rounded-3xl border bg-card p-5" aria-labelledby="pickup-title">
                            <h2 id="pickup-title" className="font-medium">Pickup</h2>
                            <p className="mt-1 text-sm text-muted-foreground">We’ll hold your order for 30 minutes after you place it.</p>
                            <StrikeDots strikes={user.strikes ?? 0} className="mt-3" />
                            <details className="mt-3 text-sm">
                                <summary className="cursor-pointer font-medium text-roast">How pickups work</summary>
                                <p className="mt-2 text-muted-foreground">
                                    Show the QR code on your ticket at the counter. If an order isn’t picked up within 30 minutes it expires and counts as a missed pickup. Three missed pickups pause ordering for 24 hours.
                                </p>
                            </details>
                        </section>
                    )}

                    <section className="rounded-3xl border bg-card p-5" aria-labelledby="total-title">
                        <h2 id="total-title" className="sr-only">Total</h2>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span className="tabular-nums">${total.toFixed(2)}</span>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between">
                            <span className="font-medium">Total</span>
                            <span className="display text-3xl font-semibold tabular-nums">${total.toFixed(2)}</span>
                        </div>
                    </section>

                    <div className="fixed inset-x-0 bottom-[calc(var(--bottom-bar-h)+env(safe-area-inset-bottom,0px))] z-30 border-t bg-background/95 p-3 backdrop-blur-sm md:static md:border-0 md:bg-transparent md:p-0">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting || paused}
                            className="flex h-13 w-full items-center justify-between rounded-full bg-primary px-6 text-base font-medium text-primary-foreground disabled:opacity-50"
                        >
                            {paused ? (
                                <span className="w-full text-center">Ordering paused until {pausedUntil}</span>
                            ) : isSubmitting ? (
                                <span className="flex w-full items-center justify-center gap-2">
                                    <Loader2 className="size-5 animate-spin" aria-hidden="true" /> Placing order…
                                </span>
                            ) : (
                                <>
                                    <span>Place order</span>
                                    <span className="tabular-nums">${total.toFixed(2)}</span>
                                </>
                            )}
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
