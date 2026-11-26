'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { IOrder, OrderStatus } from '@/types';
import { ORDER_STATUS, describeCustomizations, orderCode } from '@/features/orders/order-status';
import { cn } from '@/lib/utils';

const REFRESH_MS = 15000;

type Lane = {
    status: Extract<OrderStatus, 'pending' | 'confirmed' | 'ready'>;
    /** Lamp colour on the board, matching the homepage pickup board. */
    lamp: string;
    next?: { status: OrderStatus; label: string; primary: boolean };
    empty: string;
};

const LANES: Lane[] = [
    { status: 'pending', lamp: 'text-st-received', next: { status: 'confirmed', label: 'Start brewing', primary: false }, empty: 'No new orders' },
    { status: 'confirmed', lamp: 'text-brewing', next: { status: 'ready', label: 'Mark ready', primary: true }, empty: 'Nothing brewing' },
    { status: 'ready', lamp: 'text-signal', empty: 'Nothing waiting for pickup' },
];

function itemName(item: IOrder['items'][number]) {
    return typeof item.product === 'object' && item.product && 'name' in item.product ? item.product.name : 'Item';
}

function OrderSlat({ order, lane, onAdvance }: { order: IOrder; lane: Lane; onAdvance: (id: string, status: OrderStatus) => void }) {
    const code = orderCode(order._id.toString());
    const placed = new Date(order.createdAt);

    return (
        <li className="rounded-sm bg-slat p-4">
            <div className="flex items-baseline justify-between gap-3">
                <p className="ticket-number text-[2.5rem]"><span className="sr-only">Order </span>{code}</p>
                <p className="text-sm text-muted-foreground">
                    <time dateTime={placed.toISOString()} title={placed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}>
                        {formatDistanceToNowStrict(placed, { addSuffix: true })}
                    </time>
                </p>
            </div>

            <ul className="mt-3 space-y-1.5">
                {order.items.map((item, idx) => {
                    const details = describeCustomizations(item.customizations);
                    return (
                        <li key={idx} className="leading-snug">
                            <span className="font-bold tabular-nums">{item.quantity} ×</span> {itemName(item)}
                            {details && <span className="block text-sm text-muted-foreground">{details}</span>}
                        </li>
                    );
                })}
            </ul>

            {lane.next ? (
                <button
                    type="button"
                    onClick={() => onAdvance(order._id.toString(), lane.next!.status)}
                    aria-label={`${lane.next.label}: order ${code}`}
                    className={cn(
                        'display mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-sm px-4 text-[1.25rem] tracking-[0.02em] transition-colors',
                        lane.next.primary
                            ? 'bg-signal text-roast hover:bg-[#ffc457]'
                            : 'text-foreground shadow-[inset_0_0_0_2px_var(--foam)] hover:bg-foreground/10'
                    )}
                >
                    {lane.next.label}
                </button>
            ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                    Waiting for the customer. Held until{' '}
                    <strong className="text-foreground">{new Date(order.expiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong>.
                </p>
            )}
        </li>
    );
}

export default function OrderQueue() {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

    const fetchOrders = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await fetch('/api/staff/orders');
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
                setUpdatedAt(new Date());
            }
        } catch (error) {
            console.error('Fetch orders failed', error);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(() => fetchOrders(true), REFRESH_MS);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const updateStatus = async (id: string, newStatus: OrderStatus) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
                toast.success(`Order ${orderCode(id)} is now ${ORDER_STATUS[newStatus].label}`);
            } else {
                toast.error(data.error || 'Failed to update order');
            }
        } catch {
            toast.error('Something went wrong');
        }
    };

    if (loading && orders.length === 0) {
        return (
            <div className="flex h-[60vh] items-center justify-center" role="status">
                <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Loading the order board</span>
            </div>
        );
    }

    const lanes = LANES.map((lane) => ({ lane, list: orders.filter((o) => o.status === lane.status) }));
    const summary = lanes.map(({ lane, list }) => `${list.length} ${ORDER_STATUS[lane.status].label.toLowerCase()}`).join(', ');

    return (
        <div className="mx-auto max-w-[1600px]">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="display text-section">Order board</h1>
                    <p className="mt-2 text-muted-foreground">
                        Live. Refreshes every 15 seconds
                        {updatedAt && <>, last at {updatedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</>}.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => fetchOrders()}
                    className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-foreground/20 px-4 font-bold text-muted-foreground transition-colors hover:text-foreground"
                >
                    <RefreshCw className={cn('size-4', loading && 'animate-spin')} aria-hidden="true" />
                    Refresh
                </button>
            </header>

            <p className="sr-only" aria-live="polite">{summary}</p>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {lanes.map(({ lane, list }) => {
                    const meta = ORDER_STATUS[lane.status];
                    const headingId = `lane-${lane.status}`;
                    return (
                        <section key={lane.status} aria-labelledby={headingId} className="rounded-xl bg-panel p-4 shadow-[inset_0_0_0_1px_rgb(244_234_221/0.06)]">
                            <div className="flex items-center justify-between gap-3 px-1 pb-3">
                                <h2 id={headingId} className="display flex items-center gap-2.5 text-[1.75rem] leading-none">
                                    <span
                                        aria-hidden="true"
                                        className={cn('size-2.5 shrink-0 rounded-full bg-current shadow-[0_0_10px_currentColor]', lane.lamp)}
                                    />
                                    {meta.label}
                                </h2>
                                <span className="display min-w-10 rounded-sm bg-slat px-2.5 py-1 text-center text-[1.375rem] tabular-nums">
                                    {list.length}<span className="sr-only"> {list.length === 1 ? 'order' : 'orders'}</span>
                                </span>
                            </div>

                            {list.length === 0 ? (
                                <p className="rounded-sm border-2 border-dashed border-slat px-4 py-8 text-center text-muted-foreground">{lane.empty}</p>
                            ) : (
                                <ul className="space-y-2">
                                    {list.map((order) => (
                                        <OrderSlat key={order._id.toString()} order={order} lane={lane} onAdvance={updateStatus} />
                                    ))}
                                </ul>
                            )}
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
