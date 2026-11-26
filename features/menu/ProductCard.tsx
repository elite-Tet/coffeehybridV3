'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Coffee, Plus } from 'lucide-react';
import { IProduct } from '@/types';
import { cn } from '@/lib/utils';

interface ProductCardProps {
    product: IProduct;
    onOpen: (product: IProduct) => void;
    onQuickAdd: (product: IProduct) => void;
}

/**
 * A menu row styled like a board slat: photo, big name, price.
 * The row opens the customize sheet; the + button adds it with default options.
 * (Two sibling buttons, not nested, so both stay keyboard-reachable.)
 */
export default function ProductCard({ product, onOpen, onQuickAdd }: ProductCardProps) {
    const soldOut = !product.isAvailable;
    const [broken, setBroken] = useState(!product.imageUrl);

    return (
        <article className="group relative h-full">
            <button
                type="button"
                onClick={() => onOpen(product)}
                disabled={soldOut}
                className="flex h-full w-full gap-4 rounded-xl bg-panel p-3 pr-16 text-left transition-colors hover:bg-slat disabled:cursor-not-allowed"
                aria-label={soldOut ? `${product.name}, sold out` : `Customize ${product.name}, $${product.basePrice.toFixed(2)}`}
            >
                <span className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-slat sm:size-28">
                    {broken ? (
                        <span className="flex h-full items-center justify-center text-muted-foreground/60"><Coffee className="size-8" aria-hidden="true" /></span>
                    ) : (
                        <Image
                            onError={() => setBroken(true)}
                            src={product.imageUrl}
                            alt=""
                            fill
                            sizes="112px"
                            className={cn('object-cover', soldOut && 'grayscale opacity-60')}
                        />
                    )}
                </span>
                <span className="flex min-w-0 flex-col justify-center gap-1">
                    <span className="display text-[1.75rem] leading-none transition-colors group-hover:text-signal">{product.name}</span>
                    <span className="line-clamp-2 text-sm text-muted-foreground">{product.description}</span>
                    <span className="text-lg font-bold tabular-nums">
                        {soldOut ? <span className="text-muted-foreground">Sold out</span> : `$${product.basePrice.toFixed(2)}`}
                    </span>
                </span>
            </button>

            {!soldOut && (
                <button
                    type="button"
                    onClick={() => onQuickAdd(product)}
                    className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-sm bg-signal text-roast transition-colors hover:bg-[#ffc457] active:scale-95"
                    aria-label={`Add ${product.name} with default options`}
                >
                    <Plus className="size-5" strokeWidth={2.5} aria-hidden="true" />
                </button>
            )}
        </article>
    );
}
