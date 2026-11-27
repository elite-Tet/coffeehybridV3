import { QRCodeSVG } from 'qrcode.react';
import type { OrderStatus } from '@/types';
import StatusChip from '@/features/orders/StatusChip';
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
 * The pickup ticket: a board panel with punched notches, the order code set
 * big in the board face, and the QR on a pure white square for reliable scanning.
 * Everything wraps instead of overflowing at 320px.
 */
export default function PickupTicket({ code, qrValue, status, name, holdUntil, className }: PickupTicketProps) {
    const dead = status === 'expired' || status === 'cancelled';
    const used = status === 'completed';

    return (
        <div className={cn('ticket relative w-full min-w-0 overflow-hidden rounded-xl px-5 pb-6 pt-6 sm:px-7', className)}>
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{name ? `For ${name.split(' ')[0]}` : 'Your order'}</p>
                    <p className="ticket-number mt-1 text-[clamp(3.5rem,16vw,5.5rem)]" aria-label={`Order number ${code}`}>{code}</p>
                </div>
                <StatusChip status={status} />
            </div>

            <div className="my-5 border-t-2 border-dashed border-slat" aria-hidden="true" />

            <div className="flex flex-wrap items-center gap-5">
                <div className="relative shrink-0 rounded-lg bg-white p-3">
                    <QRCodeSVG className={cn((dead || used) && 'opacity-30')} value={qrValue} size={132} level="M" bgColor="#ffffff" fgColor="#000000" title={`QR code for order ${code}`} />
                    {(dead || used) && (
                        <span className="absolute inset-0 flex items-center justify-center">
                            <span className="rounded-sm bg-roast px-3 py-1 text-sm font-bold text-foreground">
                                {used ? 'Used' : 'Expired'}
                            </span>
                        </span>
                    )}
                </div>
                <p className="min-w-[9rem] flex-1 leading-relaxed">
                    {used
                        ? 'Picked up. Enjoy your coffee.'
                        : dead
                          ? 'This code no longer works.'
                          : <>Show this code at the counter.{holdUntil && <><br /><span className="text-muted-foreground">We hold it until </span><strong>{new Date(holdUntil).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong>.</>}</>}
                </p>
            </div>
        </div>
    );
}
