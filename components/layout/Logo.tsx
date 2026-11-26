import Link from 'next/link';

/** Wordmark: a small cup-lid mark + "CoffeeHybrid" in Fraunces. */
export default function Logo({ href = '/', className = '' }: { href?: string; className?: string }) {
    return (
        <Link href={href} className={`flex items-center gap-2 ${className}`} aria-label="CoffeeHybrid home">
            <svg viewBox="0 0 24 24" className="size-6 text-foreground" aria-hidden="true">
                <path d="M5 8h14l-1.6 12.2a2 2 0 0 1-2 1.8H8.6a2 2 0 0 1-2-1.8L5 8Z" fill="currentColor" opacity=".15" />
                <path d="M4 6.5h16M5.5 6.5 6.4 3.6A1 1 0 0 1 7.4 3h9.2a1 1 0 0 1 1 .6l.9 2.9M5 8h14l-1.6 12.2a2 2 0 0 1-2 1.8H8.6a2 2 0 0 1-2-1.8L5 8Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M6 12.5h12" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <span className="display text-xl font-semibold">CoffeeHybrid</span>
        </Link>
    );
}
