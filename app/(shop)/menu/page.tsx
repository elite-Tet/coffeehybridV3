'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { IProduct, ICategory } from '@/types';
import CategoryTabs from '@/features/menu/CategoryTabs';
import ProductCard from '@/features/menu/ProductCard';
import ProductModal from '@/features/menu/ProductModal';
import { useCartStore } from '@/features/cart/cart.store';
import { describeCustomizations } from '@/features/orders/order-status';
import { boardButtonPrimary } from '@/components/layout/board-styles';

function greeting() {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function MenuPage() {
    const { data: session } = useSession();
    const addItem = useCartStore((s) => s.addItem);
    const [products, setProducts] = useState<IProduct[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
    // The sheet opens from code, so remember what opened it and hand focus back on close.
    const openerRef = useRef<HTMLElement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    fetch('/api/products').then(async (res) => {
                        if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
                        return res.json();
                    }),
                    fetch('/api/categories').then(async (res) => {
                        if (!res.ok) throw new Error(`Categories fetch failed: ${res.status}`);
                        return res.json();
                    }),
                ]);
                if (productsRes.success) setProducts(productsRes.data);
                if (categoriesRes.success) setCategories(categoriesRes.data);
            } catch (error) {
                console.error('Error fetching data', error);
                setLoadError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredProducts = products.filter((product) => {
        const matchesCategory =
            activeCategory === null ||
            product.category === activeCategory ||
            (typeof product.category === 'object' && (product.category as ICategory)._id === activeCategory);
        const q = searchQuery.toLowerCase();
        const matchesSearch = product.name.toLowerCase().includes(q) || product.description.toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
    });
    // Available drinks first, sold-out ones stay visible at the end so people know they exist.
    filteredProducts.sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable));

    const openProduct = (p: IProduct) => {
        openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setSelectedProduct(p);
        setIsModalOpen(true);
    };

    const quickAdd = (p: IProduct) => {
        const o = p.customizationOptions;
        const size = o.sizes[0];
        const defaults = { size: size?.label, sugarLevel: o.sugarLevels[0], iceOption: o.iceOptions[0], addOns: [] };
        addItem(p, defaults, p.basePrice + (size?.priceModifier ?? 0));
        toast.success(`${p.name} added`, {
            description: describeCustomizations(defaults),
            action: { label: 'Customize', onClick: () => openProduct(p) },
        });
    };

    const firstName = session?.user?.name?.split(' ')[0];

    return (
        <div className="mx-auto max-w-7xl px-4 pt-8 md:px-12 md:pt-12">
            <header>
                <p className="text-muted-foreground">{firstName ? `${greeting()}, ${firstName}` : greeting()}</p>
                <h1 className="display mt-1 text-section">What are you drinking?</h1>
            </header>

            <div className="sticky top-16 z-20 -mx-4 mt-8 space-y-3 bg-background/95 px-4 py-3 backdrop-blur-sm md:top-[72px] md:mx-0 md:flex md:items-center md:gap-4 md:space-y-0 md:px-0">
                <div role="search" className="relative block md:order-2 md:ml-auto md:w-72">
                    <label htmlFor="menu-search" className="sr-only">Search the menu</label>
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <input
                        id="menu-search"
                        type="search"
                        placeholder="Search drinks"
                        autoComplete="off"
                        spellCheck={false}
                        enterKeyHint="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 w-full rounded-sm border border-input bg-panel pl-10 pr-4 text-base placeholder:text-muted-foreground focus-visible:border-signal"
                    />
                </div>
                <CategoryTabs categories={categories.filter((c) => c.isActive)} activeCategory={activeCategory} onSelect={setActiveCategory} />
            </div>

            {loading ? (
                <ul className="mt-6 grid gap-3 lg:grid-cols-2" aria-label="Loading menu" aria-busy="true">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <li key={i} className="flex gap-4 rounded-xl bg-panel p-3">
                            <div className="size-24 shrink-0 animate-pulse rounded-lg bg-slat sm:size-28" />
                            <div className="flex flex-1 flex-col justify-center gap-2">
                                <div className="h-6 w-2/3 animate-pulse rounded-sm bg-slat" />
                                <div className="h-3 w-full animate-pulse rounded-sm bg-slat" />
                                <div className="h-4 w-16 animate-pulse rounded-sm bg-slat" />
                            </div>
                        </li>
                    ))}
                </ul>
            ) : loadError ? (
                <div className="mt-10 rounded-xl bg-panel p-8 text-center">
                    <h2 className="display text-[2rem]">The menu didn’t load</h2>
                    <p className="mt-2 text-muted-foreground">Check your connection, then try again.</p>
                    <button type="button" onClick={() => location.reload()} className={`${boardButtonPrimary} mt-6`}>
                        Try again
                    </button>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="mt-10 rounded-xl border-2 border-dashed border-slat p-10 text-center">
                    {products.length === 0 ? (
                        <>
                            <h2 className="display text-[2rem]">The bar is still setting up</h2>
                            <p className="mt-2 text-muted-foreground">No drinks are on the menu yet. Check back soon.</p>
                        </>
                    ) : (
                        <>
                            <h2 className="display text-[2rem]">
                                {searchQuery ? `No drinks match “${searchQuery}”` : 'Nothing in this category yet'}
                            </h2>
                            <p className="mt-2 text-muted-foreground">Try another word, or pick a different category.</p>
                            <button
                                type="button"
                                onClick={() => { setSearchQuery(''); setActiveCategory(null); }}
                                className="mt-4 inline-flex min-h-11 items-center font-bold text-signal underline underline-offset-4"
                            >
                                Show all drinks
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <ul className="mt-6 grid gap-3 lg:grid-cols-2">
                    {filteredProducts.map((product) => (
                        <li key={product._id as string}>
                            <ProductCard product={product} onOpen={openProduct} onQuickAdd={quickAdd} />
                        </li>
                    ))}
                </ul>
            )}

            <ProductModal
                key={selectedProduct?._id?.toString() || 'none'}
                product={selectedProduct}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                returnFocusTo={openerRef}
            />
        </div>
    );
}
