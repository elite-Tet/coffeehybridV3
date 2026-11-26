'use client';

import { useEffect, useState } from 'react';
import { Download, Loader2, Search } from 'lucide-react';
import { IOrder, IUser, OrderStatus } from '@/types';
import StatusChip from '@/features/orders/StatusChip';
import { ORDER_STATUS, orderCode } from '@/features/orders/order-status';
import { downloadCsv, ordersToCsv } from '@/features/admin/orders-csv';
import { adminField, adminOutlineButton, adminPanel } from '@/features/admin/admin-styles';
import { cn } from '@/lib/utils';

const FILTERS: Array<'all' | OrderStatus> = ['all', 'completed', 'pending', 'expired'];

function itemName(item: IOrder['items'][number]) {
    return typeof item.product === 'object' && item.product && 'name' in item.product ? item.product.name : 'Item';
}

export default function OrderHistory() {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

    useEffect(() => {
        async function fetchOrders() {
            try {
                const res = await fetch('/api/admin/orders');
                const data = await res.json();
                if (data.success) setOrders(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    const query = searchQuery.trim().toLowerCase();
    const filtered = orders.filter(o => {
        const user = o.user as IUser;
        const id = o._id.toString();
        const matchesSearch = !query ||
            id.includes(query) ||
            orderCode(id).toLowerCase().includes(query) ||
            user?.name?.toLowerCase().includes(query) ||
            user?.email?.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const exportCsv = () => {
        downloadCsv(ordersToCsv(filtered), `orders-${new Date().toISOString().slice(0, 10)}.csv`);
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center" role="status">
                <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Loading orders</span>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="display text-section">All orders</h1>
                    <p className="mt-2 text-muted-foreground" aria-live="polite">
                        Showing {filtered.length} of {orders.length}.
                    </p>
                </div>
                <button type="button" onClick={exportCsv} disabled={filtered.length === 0} className={cn(adminOutlineButton, 'disabled:opacity-50')}>
                    <Download className="size-4" aria-hidden="true" />
                    Export CSV
                </button>
            </header>

            <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <label htmlFor="order-search" className="sr-only">Search orders</label>
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <input
                        id="order-search"
                        type="search"
                        placeholder="Search by code, name or email"
                        className={cn(adminField, 'pl-9')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-1.5">
                    {FILTERS.map((filter) => {
                        const active = statusFilter === filter;
                        return (
                            <button
                                key={filter}
                                type="button"
                                aria-pressed={active}
                                onClick={() => setStatusFilter(filter)}
                                className={cn(
                                    'inline-flex min-h-11 items-center rounded-sm px-4 font-bold transition-colors',
                                    active ? 'bg-foreground text-roast' : 'bg-panel text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {filter === 'all' ? 'All' : ORDER_STATUS[filter].label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {filtered.length === 0 ? (
                <p className="mt-6 rounded-xl border-2 border-dashed border-slat px-4 py-10 text-center text-muted-foreground">
                    {orders.length === 0 ? 'No orders yet.' : 'No orders match these filters.'}
                </p>
            ) : (
                <ul className={cn(adminPanel, 'mt-6 space-y-1.5 p-3')}>
                    {filtered.map((order) => {
                        const id = order._id.toString();
                        const user = order.user as IUser;
                        const placed = new Date(order.createdAt);
                        return (
                            <li key={id} className="grid grid-cols-[auto_1fr_auto] items-start gap-x-4 gap-y-2 rounded-sm bg-slat px-4 py-3 md:grid-cols-[5.5rem_1fr_auto_auto] md:items-center">
                                <p className="ticket-number text-[2rem]" title={id}>
                                    <span className="sr-only">Order </span>{orderCode(id)}
                                </p>
                                <div className="min-w-0">
                                    <p className="font-bold">{user?.name || 'Guest'}</p>
                                    {user?.email && <p className="truncate text-sm text-muted-foreground">{user.email}</p>}
                                    <p className="mt-1 text-sm">
                                        {order.items.map((item) => `${item.quantity} × ${itemName(item)}`).join(', ')}
                                    </p>
                                </div>
                                <div className="row-span-2 text-right md:row-span-1 md:order-last">
                                    <p className="font-bold tabular-nums">${order.total.toFixed(2)}</p>
                                    <p className="text-sm text-muted-foreground">
                                        <time dateTime={placed.toISOString()}>
                                            {placed.toLocaleDateString([], { month: 'short', day: 'numeric' })},{' '}
                                            {placed.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                        </time>
                                    </p>
                                </div>
                                <StatusChip status={order.status} className="col-start-2 justify-self-start md:col-start-auto" />
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
