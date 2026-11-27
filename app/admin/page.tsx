'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { OrderStatus } from '@/types';
import { ORDER_STATUS } from '@/features/orders/order-status';
import { cn } from '@/lib/utils';

/** Shape of GET /api/admin/analytics. */
interface AnalyticsStats {
    totalOrders: number;
    /** Sum of completed orders only. */
    totalRevenue: number;
    statusBreakdown?: Partial<Record<OrderStatus, number>>;
    categoryBreakdown: Array<{
        categoryId: string;
        name: string;
        count: number;
        revenue: number;
    }>;
}

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'ready', 'completed', 'expired', 'cancelled'];

const money = (n: number) => n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
    return (
        <div className="rounded-xl bg-panel p-5 shadow-[inset_0_0_0_1px_rgb(244_234_221/0.06)]">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="ticket-number mt-2 text-[clamp(2.5rem,5vw,3.5rem)]">{value}</dd>
            <dd className="mt-2 text-sm text-muted-foreground">{note}</dd>
        </div>
    );
}

function Bar({ share, className }: { share: number; className: string }) {
    return (
        <div className="h-2 w-full overflow-hidden rounded-sm bg-slat" aria-hidden="true">
            <div className={cn('h-full rounded-sm', className)} style={{ width: `${Math.round(share * 100)}%` }} />
        </div>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AnalyticsStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/admin/analytics');
                const data = await res.json();
                if (data.success) setStats(data.data);
            } catch (err) {
                console.error('Failed to fetch analytics', err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center" role="status">
                <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Loading the overview</span>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="mx-auto max-w-7xl">
                <h1 className="display text-section">Overview</h1>
                <div className="mt-8 rounded-xl bg-panel p-6">
                    <p className="font-bold">The numbers didn’t load.</p>
                    <button type="button" onClick={() => location.reload()} className="mt-3 inline-flex min-h-11 items-center font-bold text-signal underline underline-offset-4">
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    const count = (s: OrderStatus) => stats.statusBreakdown?.[s] ?? 0;
    const active = count('pending') + count('confirmed') + count('ready');
    const closed = count('completed') + count('expired');
    const noShowRate = closed > 0 ? count('expired') / closed : null;
    const categoryRevenue = stats.categoryBreakdown.reduce((sum, c) => sum + c.revenue, 0);
    const categories = [...stats.categoryBreakdown].sort((a, b) => b.revenue - a.revenue);

    return (
        <div className="mx-auto max-w-7xl">
            <header>
                <h1 className="display text-section">Overview</h1>
                <p className="mt-2 text-muted-foreground">All-time numbers from the order database.</p>
            </header>

            <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Stat label="Revenue" value={money(stats.totalRevenue)} note="From picked-up orders" />
                <Stat label="Orders" value={stats.totalOrders.toLocaleString()} note="Every order ever placed" />
                <Stat label="Active now" value={active.toLocaleString()} note="Received, brewing or ready" />
                <Stat
                    label="No-show rate"
                    value={noShowRate === null ? '–' : `${Math.round(noShowRate * 100)}%`}
                    note="Expired out of picked up plus expired"
                />
            </dl>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <section aria-labelledby="by-status" className="rounded-xl bg-panel p-5 shadow-[inset_0_0_0_1px_rgb(244_234_221/0.06)]">
                    <h2 id="by-status" className="display text-[1.75rem] leading-none">Orders by status</h2>
                    <ul className="mt-5 space-y-4">
                        {STATUS_ORDER.map((s) => {
                            const meta = ORDER_STATUS[s];
                            const n = count(s);
                            return (
                                <li key={s} className="space-y-1.5">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="flex items-center gap-2">
                                            <span className={cn('size-2.5 rounded-full', meta.dot)} aria-hidden="true" />
                                            {meta.label}
                                        </span>
                                        <span className="font-bold tabular-nums">{n.toLocaleString()}</span>
                                    </div>
                                    <Bar share={stats.totalOrders > 0 ? n / stats.totalOrders : 0} className={meta.dot} />
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <section aria-labelledby="by-category" className="rounded-xl bg-panel p-5 shadow-[inset_0_0_0_1px_rgb(244_234_221/0.06)] lg:col-span-2">
                    <h2 id="by-category" className="display text-[1.75rem] leading-none">Sales by category</h2>
                    <p className="mt-2 text-sm text-muted-foreground">Drinks ordered and their value, across all orders.</p>
                    {categories.length === 0 ? (
                        <p className="mt-5 rounded-sm border-2 border-dashed border-slat px-4 py-8 text-center text-muted-foreground">No sales yet</p>
                    ) : (
                        <table className="mt-4 w-full border-separate border-spacing-y-1.5">
                            <caption className="sr-only">Drinks ordered and value by category</caption>
                            <thead>
                                <tr className="text-left text-sm text-muted-foreground">
                                    <th scope="col" className="px-3 pb-1 font-normal">Category</th>
                                    <th scope="col" className="px-3 pb-1 text-right font-normal">Drinks</th>
                                    <th scope="col" className="px-3 pb-1 text-right font-normal">Value</th>
                                    <th scope="col" className="hidden w-1/4 px-3 pb-1 font-normal sm:table-cell"><span className="sr-only">Share of value</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat.categoryId}>
                                        <td className="h-12 rounded-l-sm bg-slat px-3 font-bold">{cat.name}</td>
                                        <td className="h-12 bg-slat px-3 text-right tabular-nums">{cat.count.toLocaleString()}</td>
                                        <td className="h-12 bg-slat px-3 text-right tabular-nums max-sm:rounded-r-sm">{money(cat.revenue)}</td>
                                        <td className="hidden h-12 rounded-r-sm bg-slat px-3 sm:table-cell">
                                            <Bar share={categoryRevenue > 0 ? cat.revenue / categoryRevenue : 0} className="bg-foreground/70" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            </div>
        </div>
    );
}
