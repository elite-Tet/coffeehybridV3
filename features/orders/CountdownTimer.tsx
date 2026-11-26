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

function secondsUntil(expiresAt: string | Date) {
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

/**
 * Board-style countdown: a big mm:ss that visibly ticks, over a bar that drains
 * across the 30-minute window and turns to the brewing colour in the last 5 minutes.
 * (Replaces a ring that looked like a plain filled circle for most of the window.)
 * The ticking number is not announced; only the 5-minute warning is.
 */
export default function CountdownTimer({ expiresAt, status }: CountdownTimerProps) {
    const isRunning = status === 'pending' || status === 'confirmed' || status === 'ready';
    const [secondsLeft, setSecondsLeft] = useState(() => secondsUntil(expiresAt));
    const [announcement, setAnnouncement] = useState('');
    const warned = useRef(false);

    useEffect(() => {
        if (!isRunning) return;
        const update = () => {
            const s = secondsUntil(expiresAt);
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
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const ss = String(secondsLeft % 60).padStart(2, '0');
    const summary = secondsLeft === 0 ? 'Time’s up' : `${Math.ceil(secondsLeft / 60)} minutes left to pick up`;

    return (
        <div className="rounded-xl bg-panel p-5">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                <p className={cn('display text-[3.5rem] leading-none tabular-nums', low ? 'text-brewing' : 'text-foreground')} aria-hidden="true">
                    {secondsLeft === 0 ? '00:00' : `${mm}:${ss}`}
                </p>
                <p className={cn('pb-1 text-sm', low ? 'font-bold text-brewing' : 'text-muted-foreground')}>
                    {low ? 'Hurry, after this the order expires.' : 'left to pick up before the order expires'}
                </p>
            </div>
            <span className="sr-only">{summary}</span>
            <div className="mt-4 h-2 overflow-hidden rounded-sm bg-slat" aria-hidden="true">
                <div
                    className={cn('h-full origin-left rounded-sm transition-transform duration-1000 ease-linear motion-reduce:transition-none', low ? 'bg-brewing' : 'bg-signal')}
                    style={{ transform: `scaleX(${fraction})` }}
                />
            </div>
            <p className="sr-only" aria-live="polite">{announcement}</p>
        </div>
    );
}
