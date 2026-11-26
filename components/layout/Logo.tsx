import Link from 'next/link';
import { cn } from '@/lib/utils';

/** Wordmark: "Coffee" in foam, "Hybrid" in the signal colour, set in the board face. */
export default function Logo({ href = '/', className = '' }: { href?: string; className?: string }) {
    return (
        <Link
            href={href}
            aria-label="CoffeeHybrid home"
            className={cn('display inline-flex min-h-11 items-center text-[1.75rem] font-black leading-none', className)}
        >
            Coffee<span className="text-signal">Hybrid</span>
        </Link>
    );
}
