import Image from 'next/image';
import Link from 'next/link';
import { boardButtonGhost } from '@/components/layout/board-styles';
import type { MenuPreviewItem } from '@/features/home/get-menu-preview';

/** "On the bar today": big-type list of real drinks, one photo beside it. */
export default function MenuPreview({ items }: { items: MenuPreviewItem[] }) {
    const feature = items.find((i) => i.imageUrl);

    return (
        <section aria-labelledby="menu-title" className="mx-auto max-w-7xl px-4 py-16 md:px-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <h2 id="menu-title" className="display text-section">On the bar today</h2>
                <Link href="/menu" className={boardButtonGhost}>Full menu</Link>
            </div>

            {items.length === 0 ? (
                <p className="text-muted-foreground">
                    The menu didn’t load just now. <Link href="/menu" className="text-foreground underline underline-offset-4">Open the full menu</Link> to see today’s drinks.
                </p>
            ) : (
                <div className="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
                    <ul className="border-t-2 border-slat">
                        {items.map((item) => (
                            <li key={item.id}>
                                <Link
                                    href="/menu"
                                    className="group flex min-h-14 items-baseline justify-between gap-4 border-b-2 border-slat py-4"
                                >
                                    <span className="display text-[clamp(1.75rem,4.5vw,3rem)] leading-none transition-colors group-hover:text-signal">
                                        {item.name}
                                    </span>
                                    <span className="text-xl font-bold tabular-nums text-muted-foreground">${item.price.toFixed(2)}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {feature && (
                        <figure className="overflow-hidden rounded-xl">
                            <Image
                                src={feature.imageUrl.replace('w=400&h=400', 'w=800&h=1000')}
                                alt=""
                                width={800}
                                height={1000}
                                sizes="(min-width: 1024px) 40vw, 100vw"
                                className="aspect-[4/5] w-full object-cover"
                            />
                            <figcaption className="sr-only">{feature.name}</figcaption>
                        </figure>
                    )}
                </div>
            )}
        </section>
    );
}
