import Image from 'next/image';
import Link from 'next/link';
import { mockProducts } from '@/lib/mock-data';

/** "Popular today" — a still, swipeable row. No auto-scroll. */
export default function DrinkCarousel() {
    const products = mockProducts.filter((p) => p.isAvailable).slice(0, 8);

    return (
        <section aria-labelledby="popular-title" className="mx-auto max-w-6xl py-8">
            <div className="flex items-baseline justify-between px-4 md:px-6">
                <h2 id="popular-title" className="display text-3xl font-semibold">Popular today</h2>
                <Link href="/menu" className="text-sm font-medium text-roast underline-offset-4 hover:underline">
                    See the full menu
                </Link>
            </div>

            <ul className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:px-6">
                {products.map((product) => (
                    <li key={product._id} className="w-44 shrink-0 snap-start md:w-56">
                        <Link href="/menu" className="group block space-y-2">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                                <Image src={product.imageUrl} alt="" fill sizes="224px" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                            </div>
                            <div className="flex items-baseline justify-between gap-2">
                                <span className="font-medium leading-tight">{product.name}</span>
                                <span className="text-sm tabular-nums text-roast">${product.basePrice.toFixed(2)}</span>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
