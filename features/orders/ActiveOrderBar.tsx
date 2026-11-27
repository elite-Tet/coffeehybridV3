'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { QrCode } from 'lucide-react';
import type { IOrder } from '@/types';
import { ACTIVE_STATUSES, ORDER_STATUS, orderCode } from '@/features/orders/order-status';
import { cn } from '@/lib/utils';

function minutesLeft(expiresAt: Date | string) {
    return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 60000));
}

/**
 * The customer's live order, always one tap away. Sits above the phone tab bar,
 * or bottom-right on desktop. Hidden on the order page itself.
 */
export default function ActiveOrderBar() {
    const { status } = useSession();
    const pathname = usePathname();
    const [order, setOrder] = useState<IOrder | null>(null);
    const [, tick] = useState(0);

    useEffect(() => {
        if (status !== 'authenticated') return;
        let cancelled = false;
        const load = async () => {
            try {
                const res = await fetch('/api/orders');
                const data = await res.json();
                if (!cancelled && data.success) {
                    const active = (data.data as IOrder[]).find((o) => ACTIVE_STATUSES.includes(o.status));
                    setOrder(active ?? null);
                }
            } catch {
                /* keep the last known order */
            }
        };
        load();
        const poll = setInterval(load, 20000);
        const clock = setInterval(() => tick((n) => n + 1), 30000);
        return () => {
            cancelled = true;
            clearInterval(poll);
            clearInterval(clock);
        };
    }, [status, pathname]);

    if (!order || pathname?.startsWith('/order/') || pathname === '/checkout') return null;

    const ready = order.status === 'ready';
    const s = ORDER_STATUS[order.status];
    const Icon = s.icon;
    const mins = minutesLeft(order.expiresAt);

    return (
        <aside
            aria-label="Current order"
            className="fixed inset-x-3 z-30 bottom-[calc(var(--bottom-bar-h)+env(safe-area-inset-bottom,0px)+0.5rem)] md:inset-x-auto md:right-6 md:bottom-6 md:w-96"
        >
            <Link
                href={`/order/${order._id}`}
                className={cn(
                    'flex items-center gap-3 rounded-xl p-3 pr-4 shadow-[0_12px_30px_-12px_rgb(0_0_0/0.8)] transition-colors',
                    ready ? 'bg-signal text-roast' : 'bg-panel ring-1 ring-slat'
                )}
            >
                <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-sm', ready ? 'bg-roast/15' : s.tint)}>
                    <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1" aria-live="polite">
                    <span className="display block text-[1.25rem] leading-tight">
                        {ready ? 'Your order is ready' : order.status === 'confirmed' ? `Brewing order #${orderCode(order._id)}` : `Order #${orderCode(order._id)} received`}
                    </span>
                    <span className={cn('block text-sm', ready ? 'text-roast/80' : 'text-muted-foreground')}>
                        Pick up within {mins} min
                    </span>
                </span>
                <span className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-sm px-3 py-2 text-sm font-bold', ready ? 'bg-roast text-signal' : 'bg-signal text-roast')}>
                    <QrCode className="size-4" aria-hidden="true" />
                    Show code
                </span>
            </Link>
        </aside>
    );
}
