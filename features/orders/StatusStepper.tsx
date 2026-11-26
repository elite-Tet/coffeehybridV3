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
                        <div className={cn('h-1.5 rounded-full', done ? 'bg-foreground' : active ? (status === 'ready' ? 'bg-st-ready' : 'bg-st-brewing') : 'bg-muted')} />
                        <p className={cn('flex items-center gap-1 text-sm', active || done ? 'text-foreground' : 'text-muted-foreground', active && 'font-medium')}>
                            {done && <Check className="size-3.5" aria-hidden="true" />}
                            {step.label}
                        </p>
                    </li>
                );
            })}
        </ol>
    );
}
