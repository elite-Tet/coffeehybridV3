import { Check } from 'lucide-react';
import type { OrderStatus } from '@/types';
import { cn } from '@/lib/utils';

const STEPS: { key: OrderStatus; label: string }[] = [
    { key: 'pending', label: 'Received' },
    { key: 'confirmed', label: 'Brewing' },
    { key: 'ready', label: 'Ready' },
    { key: 'completed', label: 'Picked up' },
];

export default function StatusStepper({ status }: { status: OrderStatus }) {
    const current = STEPS.findIndex((s) => s.key === status);
    if (current === -1) return null; // expired / cancelled are shown elsewhere

    return (
        <ol className="grid grid-cols-4 gap-2" aria-label="Order progress">
            {STEPS.map((step, i) => {
                const done = i < current || status === 'completed';
                const active = i === current && status !== 'completed';
                return (
                    <li key={step.key} aria-current={active ? 'step' : undefined} className="space-y-2">
                        <div className={cn('h-2 rounded-sm', done ? 'bg-foreground/70' : active ? (status === 'ready' ? 'bg-signal' : 'bg-brewing') : 'bg-slat')} />
                        <p className={cn('display flex items-center gap-1 text-[1.125rem] tracking-[0.02em] sm:text-[1.375rem]', active ? (status === 'ready' ? 'text-signal' : 'text-foreground') : done ? 'text-foreground/80' : 'text-muted-foreground')}>
                            {done && <Check className="size-3.5" aria-hidden="true" />}
                            {step.label}
                        </p>
                    </li>
                );
            })}
        </ol>
    );
}
