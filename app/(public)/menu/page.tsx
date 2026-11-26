'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { IProduct, ICategory } from '@/types';
import CategoryTabs from '@/components/menu/CategoryTabs';
import ProductCard from '@/components/menu/ProductCard';
import ProductModal from '@/components/menu/ProductModal';
import { useCartStore } from '@/store/cart.store';

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
        setSelectedProduct(p);
        setIsModalOpen(true);
    };

    const quickAdd = (p: IProduct) => {
        const o = p.customizationOptions;
        const size = o.sizes[0];
        addItem(p, { size: size?.label, sugarLevel: o.sugarLevels[0], iceOption: o.iceOptions[0], addOns: [] }, p.basePrice + (size?.priceModifier ?? 0));
        toast.success(`${p.name} added`, {
            description: [size?.label, o.sugarLevels[0] && `${o.sugarLevels[0]} sugar`].filter(Boolean).join(', '),
            action: { label: 'Customize', onClick: () => openProduct(p) },
        });
    };

    const firstName = session?.user?.name?.split(' ')[0];

    return (
        <div className="mx-auto max-w-6xl px-4 pt-6 md:px-6 md:pt-10">
            <header className="space-y-1">
                <p className="text-muted-foreground">{firstName ? `${greeting()}, ${firstName}` : greeting()}</p>
                <h1 className="display text-4xl font-semibold md:text-5xl">What are you drinking?</h1>
            </header>

            <div className="sticky top-14 z-20 -mx-4 mt-6 space-y-3 border-b bg-background/95 px-4 py-3 backdrop-blur-sm md:top-16 md:mx-0 md:flex md:items-center md:gap-4 md:space-y-0 md:border-0 md:px-0">
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
                        className="h-11 w-full rounded-full border border-input bg-card pl-10 pr-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
                <CategoryTabs categories={categories.filter((c) => c.isActive)} activeCategory={activeCategory} onSelect={setActiveCategory} />
            </div>

            {loading ? (
                <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4" aria-label="Loading menu">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <li key={i} className="space-y-3">
                            <div className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
                            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                        </li>
                    ))}
                </ul>
            ) : loadError ? (
                <div className="mt-10 rounded-2xl border bg-card p-8 text-center">
                    <h2 className="text-lg font-medium">The menu didn’t load</h2>
                    <p className="mt-1 text-muted-foreground">Check your connection, then try again.</p>
                    <button type="button" onClick={() => location.reload()} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-primary-foreground">
                        Try again
                    </button>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="mt-10 rounded-2xl border border-dashed p-10 text-center">
                    <h2 className="text-lg font-medium">No drinks match “{searchQuery}”</h2>
                    <p className="mt-1 text-muted-foreground">Try another word, or pick a different category.</p>
                    <button type="button" onClick={() => { setSearchQuery(''); setActiveCategory(null); }} className="mt-4 text-sm font-medium text-roast underline underline-offset-4">
                        Clear search
                    </button>
                </div>
            ) : (
                <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
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
            />
        </div>
    );
}
