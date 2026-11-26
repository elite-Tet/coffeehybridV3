'use client';

import { ICategory } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
    categories: ICategory[];
    activeCategory: string | null;
    onSelect: (categoryId: string | null) => void;
}

export default function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
    const chip = (active: boolean) =>
        cn(
            'shrink-0 rounded-full border px-4 py-2 text-sm transition-colors',
            active ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted'
        );

    return (
        <div role="radiogroup" aria-label="Category" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
            <button type="button" role="radio" aria-checked={activeCategory === null} onClick={() => onSelect(null)} className={chip(activeCategory === null)}>
                All
            </button>
            {categories.map((category) => {
                const id = category._id as string;
                return (
                    <button key={id} type="button" role="radio" aria-checked={activeCategory === id} onClick={() => onSelect(id)} className={chip(activeCategory === id)}>
                        {category.name}
                    </button>
                );
            })}
        </div>
    );
}
