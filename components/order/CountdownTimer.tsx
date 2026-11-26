'use client';

import { useEffect, useRef, useState } from 'react';
import { ORDER_EXPIRY_MINUTES } from '@/lib/strikes';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
    expiresAt: string | Date;
    status: string;
}

const WINDOW_S = ORDER_EXPIRY_MINUTES * 60;
const WARN_S = 5 * 60;

/** Ring + "18 min left". Turns crema-amber in the last 5 minutes. Announces only the 5-minute warning. */
export default function CountdownTimer({ expiresAt, status }: CountdownTimerProps) {
    const isRunning = status === 'pending' || status === 'confirmed' || status === 'ready';
    const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    const [announcement, setAnnouncement] = useState('');
    const warned = useRef(false);

    useEffect(() => {
        if (!isRunning) return;
        const update = () => {
            const s = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
            setSecondsLeft(s);
            if (s > 0 && s <= WARN_S && !warned.current) {
                warned.current = true;
                setAnnouncement('Five minutes left to pick up your order.');
            }
        };
        update();
        const t = setInterval(update, 1000);
        return () => clearInterval(t);
    }, [expiresAt, isRunning]);

    if (!isRunning) return null;

    const low = secondsLeft <= WARN_S;
    const fraction = Math.min(1, secondsLeft / WINDOW_S);
    const r = 34;
    const c = 2 * Math.PI * r;
    const mins = Math.ceil(secondsLeft / 60);
    const label = secondsLeft === 0 ? 'Time’s up' : secondsLeft < 60 ? `${secondsLeft} sec left` : `${mins} min left`;

    return (
        <div className="flex items-center gap-4">
            <svg viewBox="0 0 80 80" className="size-20 shrink-0 -rotate-90" aria-hidden="true">
                <circle cx="40" cy="40" r={r} fill="none" strokeWidth="6" className="stroke-muted" />
                <circle
                    cx="40"
                    cy="40"
                    r={r}
                    fill="none"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={c * (1 - fraction)}
                    className={cn('transition-[stroke-dashoffset] duration-1000 ease-linear', low ? 'stroke-st-brewing' : 'stroke-foreground')}
                />
            </svg>
            <div>
                <p className="display text-3xl font-semibold tabular-nums">{label}</p>
                <p className={cn('text-sm', low ? 'font-medium' : 'text-muted-foreground')}>
                    {low ? 'Hurry — after this the order expires.' : 'to pick up before the order expires'}
                </p>
            </div>
            <p className="sr-only" aria-live="polite">{announcement}</p>
        </div>
    );
}
