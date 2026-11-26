import { CheckCircle2, CircleDashed, Coffee, PackageCheck, XCircle, type LucideIcon } from 'lucide-react';
import type { OrderStatus } from '@/types';

/** One vocabulary for order status, used by customers, staff and admin. */
export const ORDER_STATUS: Record<OrderStatus, { label: string; icon: LucideIcon; dot: string; tint: string }> = {
    pending: { label: 'Received', icon: CircleDashed, dot: 'bg-st-received', tint: 'bg-st-received/12' },
    confirmed: { label: 'Brewing', icon: Coffee, dot: 'bg-st-brewing', tint: 'bg-st-brewing/18' },
    ready: { label: 'Ready', icon: CheckCircle2, dot: 'bg-st-ready', tint: 'bg-st-ready/15' },
    completed: { label: 'Picked up', icon: PackageCheck, dot: 'bg-st-done', tint: 'bg-st-done/12' },
    expired: { label: 'Expired', icon: XCircle, dot: 'bg-st-expired', tint: 'bg-st-expired/12' },
    cancelled: { label: 'Cancelled', icon: XCircle, dot: 'bg-st-expired', tint: 'bg-st-expired/12' },
};

export const ACTIVE_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'ready'];

/** Short, human order code shown on the ticket and to staff, e.g. "A27". */
export function orderCode(id: string): string {
    const tail = id.slice(-4).toUpperCase();
    return tail;
}

export function describeCustomizations(c: { size?: string; sugarLevel?: string; iceOption?: string; addOns?: string[] }): string {
    const parts = [
        c.size,
        // Labels like "No Sugar" or "Light Ice" already name the thing; "Hot" is not an ice level.
        c.sugarLevel ? (/sugar/i.test(c.sugarLevel) ? c.sugarLevel : `${c.sugarLevel} sugar`) : undefined,
        c.iceOption ? (/ice|^hot$/i.test(c.iceOption) ? c.iceOption : `${c.iceOption} ice`) : undefined,
        ...(c.addOns ?? []),
    ].filter(Boolean);
    return parts.join(', ');
}
