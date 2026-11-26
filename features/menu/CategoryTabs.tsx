'use client';

import { ICategory } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
    categories: ICategory[];
    activeCategory: string | null;
    onSelect: (categoryId: string | null) => void;
}

/** Category filter as board slats: the active one lights up in the signal colour. */
export default function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
    const tab = (active: boolean) =>
        cn(
            'display min-h-11 shrink-0 rounded-sm px-4 text-[1.25rem] tracking-[0.03em] transition-colors',
            active ? 'bg-signal text-roast' : 'bg-panel text-muted-foreground hover:bg-slat hover:text-foreground'
        );

    return (
        <div role="radiogroup" aria-label="Category" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
            <button type="button" role="radio" aria-checked={activeCategory === null} onClick={() => onSelect(null)} className={tab(activeCategory === null)}>
                All
            </button>
            {categories.map((category) => {
                const id = category._id as string;
                return (
                    <button key={id} type="button" role="radio" aria-checked={activeCategory === id} onClick={() => onSelect(id)} className={tab(activeCategory === id)}>
                        {category.name}
                    </button>
                );
            })}
        </div>
    );
}
