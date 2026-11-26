import { ORDER_STATUS } from '@/features/orders/order-status';
import type { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

export default function StatusChip({ status, className }: { status: OrderStatus; className?: string }) {
    const s = ORDER_STATUS[status] ?? ORDER_STATUS.pending;
    const Icon = s.icon;
    return (
        <span className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-1 text-sm font-bold text-foreground', s.tint, className)}>
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {s.label}
        </span>
    );
}
