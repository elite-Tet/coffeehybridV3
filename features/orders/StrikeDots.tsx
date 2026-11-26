import { STRIKE_THRESHOLD } from '@/lib/strikes';
import { cn } from '@/lib/utils';

/** "●●○ 2 of 3 missed pickups" — count is always written out, not just shown in colour. */
export default function StrikeDots({ strikes, className }: { strikes: number; className?: string }) {
    const n = Math.min(strikes, STRIKE_THRESHOLD);
    return (
        <p className={cn('flex items-center gap-2 text-sm', className)}>
            <span className="flex gap-1" aria-hidden="true">
                {Array.from({ length: STRIKE_THRESHOLD }).map((_, i) => (
                    <span
                        key={i}
                        className={cn('size-2.5 rounded-full border', i < n ? 'bg-st-expired border-st-expired' : 'border-muted-foreground/50')}
                    />
                ))}
            </span>
            <span>
                {n} of {STRIKE_THRESHOLD} missed pickups
            </span>
        </p>
    );
}
