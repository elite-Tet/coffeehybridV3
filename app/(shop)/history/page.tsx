'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format, isToday, isYesterday } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/features/cart/cart.store';
import { IOrder, IProduct } from '@/types';
import StatusChip from '@/features/orders/StatusChip';
import { ACTIVE_STATUSES, orderCode } from '@/features/orders/order-status';

function dayLabel(d: Date) {
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'EEEE, MMM d');
}

function itemSummary(order: IOrder) {
    return order.items
        .map((i) => `${i.quantity > 1 ? `${i.quantity} × ` : ''}${(i.product as IProduct)?.name ?? 'Drink'}`)
        .join(', ');
}

export default function OrderHistoryPage() {
    const { status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/history');
            return;
        }
        if (status !== 'authenticated') return;
        (async () => {
            try {
                const res = await fetch('/api/orders');
                const data = await res.json();
                if (data.success) setOrders(data.data);
                else setError(data.error || 'Your orders didn’t load.');
            } catch {
                setError('Your orders didn’t load. Check your connection and try again.');
            } finally {
                setLoading(false);
            }
        })();
    }, [status, router]);

    if (status === 'loading' || loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center" role="status">
                <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Loading your orders</span>
            </div>
        );
    }

    const reorder = (o: IOrder) => {
        const { addItem, updateQuantity } = useCartStore.getState();
        let skipped = 0;
        for (const item of o.items) {
            const product = item.product as IProduct;
            if (!product || typeof product !== 'object' || !product.isAvailable) {
                skipped++;
                continue;
            }
            addItem(product, item.customizations, item.unitPrice);
            if (item.quantity > 1) updateQuantity(useCartStore.getState().items.length - 1, item.quantity);
        }
        if (skipped === o.items.length) {
            toast.error('Those drinks are sold out right now.');
            return;
        }
        if (skipped > 0) toast('Some drinks are sold out, so we left them out.');
        router.push('/checkout');
    };

    const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
    const past = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));
    const groups = past.reduce<Record<string, IOrder[]>>((acc, o) => {
        const key = dayLabel(new Date(o.createdAt));
        (acc[key] ||= []).push(o);
        return acc;
    }, {});

    return (
        <div className="mx-auto max-w-3xl px-4 pt-6 md:px-6 md:pt-10">
            <h1 className="display text-4xl font-semibold">Your orders</h1>

            {error && (
                <div className="mt-8 rounded-2xl border bg-card p-6">
                    <p className="font-medium">{error}</p>
                    <button type="button" onClick={() => location.reload()} className="mt-3 text-sm font-medium text-roast underline underline-offset-4">
                        Try again
                    </button>
                </div>
            )}

            {!error && orders.length === 0 && (
                <div className="mt-12 rounded-3xl border border-dashed p-10 text-center">
                    <h2 className="display text-2xl font-semibold">No orders yet</h2>
                    <p className="mt-2 text-muted-foreground">Your first coffee is a few taps away.</p>
                    <Link href="/menu" className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-6 font-medium text-primary-foreground">
                        Browse the menu
                    </Link>
                </div>
            )}

            {active.length > 0 && (
                <section aria-labelledby="active-title" className="mt-8">
                    <h2 id="active-title" className="text-lg font-medium">In progress</h2>
                    <ul className="mt-3 space-y-3">
                        {active.map((o) => (
                            <li key={o._id}>
                                <Link href={`/order/${o._id}`} className="ticket flex items-center gap-4 rounded-2xl px-6 py-4">
                                    <span className="ticket-number text-4xl">#{orderCode(o._id)}</span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate">{itemSummary(o)}</span>
                                        <span className="text-sm opacity-75">Show code</span>
                                    </span>
                                    <StatusChip status={o.status} className="bg-background/60" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {Object.entries(groups).map(([day, list]) => (
                <section key={day} aria-labelledby={`day-${day}`} className="mt-10">
                    <h2 id={`day-${day}`} className="text-sm font-medium text-muted-foreground">{day}</h2>
                    <ul className="mt-2 divide-y rounded-2xl border bg-card">
                        {list.map((o) => (
                            <li key={o._id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4">
                                <Link href={`/order/${o._id}`} className="min-w-0 flex-1 basis-48">
                                    <span className="block truncate font-medium">{itemSummary(o)}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {format(new Date(o.createdAt), 'h:mm a')}, ${o.total.toFixed(2)}
                                    </span>
                                </Link>
                                <StatusChip status={o.status} />
                                <button type="button" onClick={() => reorder(o)} className="rounded-full border px-4 py-2 text-sm hover:bg-muted">
                                    Order again
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}
