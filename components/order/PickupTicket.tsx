import { QRCodeSVG } from 'qrcode.react';
import type { OrderStatus } from '@/types';
import StatusChip from '@/components/order/StatusChip';
import { cn } from '@/lib/utils';

interface PickupTicketProps {
    code: string;
    qrValue: string;
    status: OrderStatus;
    name?: string | null;
    holdUntil?: Date | string;
    className?: string;
}

/**
 * The kraft cup-sleeve ticket. This is the brand's one loud element:
 * big hand-set order number, QR on a pure white square for reliable scanning.
 */
export default function PickupTicket({ code, qrValue, status, name, holdUntil, className }: PickupTicketProps) {
    const dead = status === 'expired' || status === 'cancelled';
    const used = status === 'completed';

    return (
        <div className={cn('ticket relative rounded-3xl px-7 pb-6 pt-7 shadow-[0_1px_0_rgba(0,0,0,0.04),0_12px_30px_-12px_rgba(60,35,20,0.35)]', className)}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm opacity-75">{name ? `For ${name.split(' ')[0]}` : 'Your order'}</p>
                    <p className="ticket-number text-7xl" aria-label={`Order number ${code}`}>#{code}</p>
                </div>
                <StatusChip status={status} className="mt-1 bg-background/60" />
            </div>

            <div className="my-6 border-t-2 border-dashed border-kraft-foreground/25" aria-hidden="true" />

            <div className="flex items-center gap-5">
                <div className={cn('relative shrink-0 rounded-2xl bg-white p-3', (dead || used) && 'opacity-40')}>
                    <QRCodeSVG value={qrValue} size={132} level="M" bgColor="#ffffff" fgColor="#000000" />
                    {(dead || used) && (
                        <span className="absolute inset-0 flex items-center justify-center">
                            <span className="rounded-full bg-foreground px-3 py-1 text-sm font-medium text-background">
                                {used ? 'Used' : 'Expired'}
                            </span>
                        </span>
                    )}
                </div>
                <p className="text-sm leading-relaxed">
                    {used
                        ? 'Picked up. Enjoy your coffee.'
                        : dead
                          ? 'This code no longer works.'
                          : <>Show this code at the counter.{holdUntil && <><br />We hold it until <strong>{new Date(holdUntil).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong>.</>}</>}
                </p>
            </div>
        </div>
    );
}
