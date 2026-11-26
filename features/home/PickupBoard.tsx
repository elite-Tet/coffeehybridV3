'use client';

import { useEffect, useReducer, useState, useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

type Status = 'Brewing' | 'Ready';
type Row = { code: string; name: string; drink: string; status: Status };

const NAMES = ['Dara', 'Sophea', 'Visal', 'Mony', 'Rithy', 'Lina', 'Bopha', 'Kosal', 'Chenda', 'Piseth'];
const DRINKS = ['Iced Latte', 'Cappuccino', 'Nitro', 'Americano', 'Espresso', 'Açaí'];
const TICK_MS = 2400;

function makeRow(n: number, status: Status): Row {
    return { code: `A${n}`, name: NAMES[n % NAMES.length], drink: DRINKS[n % DRINKS.length], status };
}

type Board = { rows: Row[]; flipped: string | null; nextNumber: number };

const INITIAL: Board = {
    rows: [makeRow(24, 'Ready'), makeRow(25, 'Ready'), makeRow(26, 'Brewing'), makeRow(27, 'Brewing'), makeRow(28, 'Brewing')],
    flipped: null,
    nextNumber: 29,
};

/** One tick: the oldest Brewing order flips to Ready; keep at most 3 Ready rows on screen. */
function tick(board: Board): Board {
    let flipped = board.flipped;
    let nextNumber = board.nextNumber;
    let rows = board.rows.map((r) => ({ ...r }));
    const brewing = rows.find((r) => r.status === 'Brewing');
    if (brewing) {
        brewing.status = 'Ready';
        flipped = brewing.code;
    }
    if (rows.filter((r) => r.status === 'Ready').length > 3) {
        rows = [...rows.slice(1), makeRow(nextNumber, 'Brewing')];
        nextNumber += 1;
    }
    return { rows, flipped, nextNumber };
}

/** true when the visitor asked the OS for less motion. */
function usePrefersReducedMotion() {
    return useSyncExternalStore(
        (onChange) => {
            const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
            mq.addEventListener('change', onChange);
            return () => mq.removeEventListener('change', onChange);
        },
        () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        () => false
    );
}

/**
 * Demo of the counter screen: order codes flip from Brewing to Ready.
 * Sample data only (labelled as an example). Auto-updates, so it has a
 * pause control (WCAG 2.2.2) and starts paused under reduced motion.
 */
export default function PickupBoard() {
    const reduceMotion = usePrefersReducedMotion();
    const [{ rows, flipped }, advance] = useReducer(tick, INITIAL);
    const [userPaused, setUserPaused] = useState<boolean | null>(null);

    // Reduced motion starts paused; an explicit Play/Pause press always wins.
    const paused = userPaused ?? reduceMotion;

    useEffect(() => {
        if (paused) return;
        const timer = setInterval(advance, TICK_MS);
        return () => clearInterval(timer);
    }, [paused]);

    return (
        <div className="rounded-xl bg-panel p-4 shadow-[inset_0_0_0_1px_rgb(244_234_221/0.06)]">
            <div className="flex items-center justify-between gap-3 px-2 pb-3">
                <p className="display text-[1.75rem] leading-none">
                    Pickup board
                    <small className="mt-1 block font-sans text-sm font-normal leading-snug tracking-normal text-muted-foreground">
                        Example of what the counter screen shows
                    </small>
                </p>
                <button
                    type="button"
                    aria-pressed={paused}
                    onClick={() => setUserPaused(!paused)}
                    className="min-h-11 min-w-11 shrink-0 whitespace-nowrap rounded-sm border border-foreground/20 px-3 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
                >
                    {paused ? 'Play' : 'Pause'}
                </button>
            </div>

            <table className="w-full border-separate border-spacing-y-1.5">
                <caption className="sr-only">Example pickup board with order codes and their status</caption>
                <thead>
                    <tr className="text-left text-sm text-muted-foreground">
                        <th scope="col" className="px-2 pb-1 font-normal">Code</th>
                        <th scope="col" className="px-2 pb-1 font-normal">Name</th>
                        <th scope="col" className="hidden px-2 pb-1 font-normal sm:table-cell">Drink</th>
                        <th scope="col" className="px-2 pb-1 font-normal">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => {
                        const flip = row.code === flipped;
                        // Changing the key remounts the cell text, which replays the flip animation.
                        const cell = (text: string) => (
                            <span key={`${row.code}-${row.status}`} className={cn('inline-block', flip && 'flip-in')}>
                                {text}
                            </span>
                        );
                        return (
                            <tr key={row.code} className="display text-board tracking-[0.03em]">
                                <td className="h-12 w-[4.5rem] rounded-l-sm bg-slat px-2 align-middle">{cell(row.code)}</td>
                                <td className="h-12 bg-slat px-2 align-middle">{cell(row.name)}</td>
                                <td className="hidden h-12 bg-slat px-2 align-middle sm:table-cell">{cell(row.drink)}</td>
                                <td className="h-12 w-[7.5rem] rounded-r-sm bg-slat px-2 align-middle">
                                    <span
                                        key={`${row.code}-${row.status}`}
                                        className={cn(
                                            'inline-flex items-center gap-2 before:size-2.5 before:rounded-full before:bg-current before:shadow-[0_0_10px_currentColor]',
                                            row.status === 'Ready' ? 'text-signal' : 'text-brewing',
                                            flip && 'flip-in'
                                        )}
                                    >
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
