'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, SunMedium } from 'lucide-react';
import { IOrder, IProduct } from '@/types';
import PickupTicket from '@/features/orders/PickupTicket';
import CountdownTimer from '@/features/orders/CountdownTimer';
import StatusStepper from '@/features/orders/StatusStepper';
import { ORDER_STATUS, describeCustomizations, orderCode } from '@/features/orders/order-status';
import { cn } from '@/lib/utils';

export default function OrderPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const [order, setOrder] = useState<IOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusNote, setStatusNote] = useState('');
    const lastStatus = useRef<string | null>(null);

    const fetchOrder = useCallback(
        async (silent = false) => {
            if (!silent) setLoading(true);
            try {
                const res = await fetch(`/api/orders/${id}`);
                const data = await res.json();
                if (data.success) {
                    setOrder(data.data);
                    setError('');
                } else {
                    setError(data.error || 'We couldn’t find that order.');
                }
            } catch {
                setError('We couldn’t load your order. Check your connection and try again.');
            } finally {
                if (!silent) setLoading(false);
            }
        },
        [id]
    );

    useEffect(() => {
        if (id) fetchOrder();
    }, [id, fetchOrder]);

    useEffect(() => {
        if (!order || ['completed', 'expired', 'cancelled'].includes(order.status)) return;
        const interval = setInterval(() => fetchOrder(true), 10000);
        return () => clearInterval(interval);
    }, [order, fetchOrder]);

    // Announce status changes (not every poll) to screen readers.
    useEffect(() => {
        if (!order) return;
        if (lastStatus.current && lastStatus.current !== order.status) {
            setStatusNote(order.status === 'ready' ? 'Your order is ready. Show your code at the counter.' : `Order status: ${ORDER_STATUS[order.status].label}.`);
        }
        lastStatus.current = order.status;
    }, [order]);

    if (loading && !order) {
        return (
            <div className="flex h-[60vh] items-center justify-center" role="status">
                <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Loading your order</span>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="mx-auto max-w-md px-4 py-20 text-center">
                <h1 className="display text-3xl font-semibold">We couldn’t find that order</h1>
                <p className="mt-2 text-muted-foreground">{error}</p>
                <Link href="/history" className="mt-6 inline-flex h-12 items-center rounded-full bg-primary px-6 font-medium text-primary-foreground">
                    See your orders
                </Link>
            </div>
        );
    }

    const code = orderCode(order._id);
    const ready = order.status === 'ready';
    const done = order.status === 'completed';
    const dead = order.status === 'expired' || order.status === 'cancelled';

    const headline = ready
        ? 'Your order is ready'
        : done
          ? 'Enjoy your coffee'
          : order.status === 'expired'
            ? 'This order expired'
            : order.status === 'cancelled'
              ? 'This order was cancelled'
              : order.status === 'confirmed'
                ? 'We’re making your drinks'
                : 'We’ve got your order';

    const sub = ready
        ? 'Show the code below at the counter.'
        : done
          ? 'Thanks for picking up on time.'
          : order.status === 'expired'
            ? 'It wasn’t picked up within 30 minutes, so it counts as a missed pickup.'
            : order.status === 'cancelled'
              ? 'You can place a new order any time.'
              : 'We’ll let you know here when it’s ready.';

    return (
        <div className="mx-auto max-w-5xl px-4 pt-6 md:px-6 md:pt-10">
            <Link href="/history" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" aria-hidden="true" /> Your orders
            </Link>

            <header className={cn('mt-4 rounded-3xl p-5 md:p-6', ready ? 'bg-st-ready text-background' : 'bg-transparent px-0 md:px-0')}>
                <h1 className="display flex items-center gap-3 text-4xl font-semibold md:text-5xl">
                    {ready && <CheckCircle2 className="size-9 shrink-0" aria-hidden="true" />}
                    {headline}
                </h1>
                <p className={cn('mt-2 text-lg', ready ? 'text-background/90' : 'text-muted-foreground')}>{sub}</p>
            </header>
            <p className="sr-only" aria-live="polite">{statusNote}</p>

            {!dead && (
                <div className="mt-6">
                    <StatusStepper status={order.status} />
                </div>
            )}

            <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,26rem)_1fr] md:items-start">
                <div className="space-y-6">
                    <PickupTicket code={code} qrValue={order.qrCode} status={order.status} name={session?.user?.name} holdUntil={order.expiresAt} />
                    {!dead && !done && (
                        <>
                            <CountdownTimer expiresAt={order.expiresAt} status={order.status} />
                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                <SunMedium className="size-4 shrink-0" aria-hidden="true" />
                                Turn your screen brightness up at the counter so the code scans first time.
                            </p>
                        </>
                    )}
                    {(dead || done) && (
                        <Link href="/menu" className="flex h-12 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground">
                            Order again
                        </Link>
                    )}
                </div>

                <section aria-labelledby="order-items" className="rounded-3xl border bg-card">
                    <div className="flex items-baseline justify-between px-5 pt-5">
                        <h2 id="order-items" className="text-lg font-medium">Your items</h2>
                        <span className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
                        </span>
                    </div>
                    <ul className="divide-y px-5">
                        {order.items.map((item, idx) => {
                            const product = item.product as IProduct;
                            return (
                                <li key={idx} className="flex gap-3 py-4">
                                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                                        {product?.imageUrl && <Image src={product.imageUrl} alt="" fill sizes="56px" className="object-cover" unoptimized />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <p className="font-medium">
                                                {item.quantity > 1 && <span className="tabular-nums">{item.quantity} × </span>}
                                                {product?.name || 'Drink'}
                                            </p>
                                            <p className="tabular-nums">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{describeCustomizations(item.customizations)}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="flex items-baseline justify-between border-t px-5 py-4">
                        <span className="font-medium">Total</span>
                        <span className="display text-2xl font-semibold tabular-nums">${order.total.toFixed(2)}</span>
                    </div>
                </section>
            </div>
        </div>
    );
}
