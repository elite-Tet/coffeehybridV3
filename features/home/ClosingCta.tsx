import Link from 'next/link';
import { boardButtonPrimary } from '@/components/layout/board-styles';

export default function ClosingCta() {
    return (
        <section aria-labelledby="closing-title" className="mx-auto max-w-7xl px-4 py-24 md:px-12">
            <h2 id="closing-title" className="display max-w-[12ch] text-hero font-black">Your code could be next.</h2>
            <div className="mt-6">
                <Link href="/menu" className={boardButtonPrimary}>Start an order</Link>
            </div>
        </section>
    );
}
