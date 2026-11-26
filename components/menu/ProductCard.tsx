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

/** Whole card opens the customize sheet; the round + adds it with default options. */
export default function ProductCard({ product, onOpen, onQuickAdd }: ProductCardProps) {
    const soldOut = !product.isAvailable;
    const [broken, setBroken] = useState(!product.imageUrl);

    return (
        <article className="group relative flex flex-col">
            <button
                type="button"
                onClick={() => onOpen(product)}
                disabled={soldOut}
                className="flex flex-col text-left disabled:cursor-not-allowed"
                aria-label={soldOut ? `${product.name}, sold out` : `Customize ${product.name}`}
            >
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted">
                    {broken ? (
                        <span className="flex h-full items-center justify-center text-muted-foreground/50"><Coffee className="size-10" aria-hidden="true" /></span>
                    ) : (
                    <Image
                        onError={() => setBroken(true)}
                        src={product.imageUrl}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 25vw, 50vw"
                        className={cn('object-cover transition-transform duration-500', !soldOut && 'group-hover:scale-[1.03]', soldOut && 'grayscale opacity-60')}
                    />
                    )}
                    {soldOut && (
                        <span className="absolute left-3 top-3 rounded-full bg-background px-2.5 py-1 text-sm font-medium">Sold out</span>
                    )}
                </div>
                <div className="mt-3 space-y-0.5 pr-12">
                    <h3 className="font-medium leading-snug">{product.name}</h3>
                    <p className="line-clamp-1 text-sm text-muted-foreground">{product.description}</p>
                    <p className="pt-1 text-sm font-medium tabular-nums text-roast">${product.basePrice.toFixed(2)}</p>
                </div>
            </button>

            {!soldOut && (
                <button
                    type="button"
                    onClick={() => onQuickAdd(product)}
                    className="absolute bottom-1 right-0 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform active:scale-95"
                    aria-label={`Add ${product.name} with default options`}
                >
                    <Plus className="size-5" aria-hidden="true" />
                </button>
            )}
        </article>
    );
}
