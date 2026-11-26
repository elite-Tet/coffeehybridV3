'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { EyeOff, Loader2, Pencil, Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { IProduct, ICategory } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { boardButtonGhost, boardButtonPrimary } from '@/components/layout/board-styles';
import { adminField, adminIconButton, adminLabel, adminOutlineButton, adminPanel } from '@/features/admin/admin-styles';
import { cn } from '@/lib/utils';

interface ProductFormData {
    name: string;
    description: string;
    basePrice: number;
    image: string;
    category: string;
    isAvailable: boolean;
    customizationOptions: {
        sizes: Array<{ label: string; priceModifier: number }>;
        sugarLevels: string[];
        iceOptions: string[];
        addOns: Array<{ label: string; price: number }>;
    };
}

const DEFAULT_OPTIONS: ProductFormData['customizationOptions'] = {
    sizes: [{ label: 'Small', priceModifier: 0 }, { label: 'Medium', priceModifier: 0.5 }, { label: 'Large', priceModifier: 1.0 }],
    sugarLevels: ['0%', '25%', '50%', '100%'],
    iceOptions: ['No Ice', 'Less Ice', 'Normal', 'Extra Ice'],
    addOns: [{ label: 'Extra Shot', price: 0.75 }, { label: 'Oat Milk', price: 0.50 }]
};

const money = (n: number) => `$${n.toFixed(2)}`;

export default function ProductManagement() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        basePrice: 0,
        image: '',
        category: '',
        isAvailable: true,
        customizationOptions: DEFAULT_OPTIONS
    });

    const fetchAll = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                fetch('/api/products').then(res => res.json()),
                fetch('/api/categories').then(res => res.json())
            ]);
            if (prodRes.success) setProducts(prodRes.data);
            if (catRes.success) setCategories(catRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const openCreateDialog = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            basePrice: 3.50,
            image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800',
            category: categories[0]?._id ? String(categories[0]._id) : '',
            isAvailable: true,
            customizationOptions: DEFAULT_OPTIONS
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (product: IProduct) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            basePrice: product.basePrice,
            image: product.image || product.imageUrl || '',
            category: typeof product.category === 'object' ? String((product.category as ICategory)._id) : String(product.category),
            isAvailable: product.isAvailable,
            customizationOptions: product.customizationOptions
        });
        setIsDialogOpen(true);
    };

    // Size rows: edit, add, remove. Saved with the rest of the form through the same POST/PATCH.
    const sizes = formData.customizationOptions.sizes;
    const setSizes = (next: ProductFormData['customizationOptions']['sizes']) =>
        setFormData((f) => ({ ...f, customizationOptions: { ...f.customizationOptions, sizes: next } }));
    const updateSize = (index: number, patch: Partial<{ label: string; priceModifier: number }>) =>
        setSizes(sizes.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    const addSize = () => setSizes([...sizes, { label: '', priceModifier: 0 }]);
    const removeSize = (index: number) => setSizes(sizes.filter((_, i) => i !== index));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
        const method = editingProduct ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Product ${editingProduct ? 'updated' : 'created'}`);
                fetchAll();
                setIsDialogOpen(false);
            } else {
                toast.error(data.error);
            }
        } catch {
            toast.error('Something went wrong');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Mark as unavailable?')) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Product updated');
                fetchAll();
            }
        } catch {
            toast.error('Failed to update product');
        }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center" role="status">
                <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Loading products</span>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="display text-section">Products</h1>
                    <p className="mt-2 text-muted-foreground">
                        {products.length} {products.length === 1 ? 'product' : 'products'}.
                    </p>
                </div>
                <button type="button" onClick={openCreateDialog} className={boardButtonPrimary}>
                    <Plus className="size-5" aria-hidden="true" />
                    New product
                </button>
            </header>

            <div className="relative mt-8 max-w-md">
                <label htmlFor="product-search" className="sr-only">Search products</label>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                    id="product-search"
                    type="search"
                    placeholder="Search products"
                    className={cn(adminField, 'pl-9')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filtered.length === 0 ? (
                <p className="mt-6 rounded-xl border-2 border-dashed border-slat px-4 py-10 text-center text-muted-foreground">
                    {products.length === 0 ? 'No products yet.' : `No products match “${searchQuery}”.`}
                </p>
            ) : (
                <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((product) => {
                        const category = typeof product.category === 'object' ? (product.category as ICategory).name : null;
                        return (
                            <li key={product._id.toString()} className={cn(adminPanel, 'flex flex-col overflow-hidden')}>
                                <div className="relative aspect-[4/3] bg-slat">
                                    <Image
                                        src={product.imageUrl}
                                        alt=""
                                        fill
                                        sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                                        className={cn('object-cover', !product.isAvailable && 'opacity-50 grayscale')}
                                    />
                                    <span
                                        className={cn(
                                            'absolute left-3 top-3 rounded-sm px-2.5 py-1 text-sm font-bold',
                                            product.isAvailable ? 'bg-roast/90 text-foreground' : 'bg-roast/90 text-destructive'
                                        )}
                                    >
                                        {product.isAvailable ? 'Available' : 'Sold out'}
                                    </span>
                                </div>
                                <div className="flex flex-1 flex-col p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="display text-[1.5rem] leading-none">{product.name}</h2>
                                        <span className="font-bold tabular-nums">{money(product.basePrice)}</span>
                                    </div>
                                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                                    <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                                        <span className="text-sm text-muted-foreground">{category ?? 'No category'}</span>
                                        <div className="flex">
                                            <button type="button" className={adminIconButton} onClick={() => openEditDialog(product)} aria-label={`Edit ${product.name}`}>
                                                <Pencil className="size-4" aria-hidden="true" />
                                            </button>
                                            <button
                                                type="button"
                                                className={cn(adminIconButton, 'hover:text-destructive')}
                                                onClick={() => handleDelete(product._id.toString())}
                                                aria-label={`Mark ${product.name} as sold out`}
                                            >
                                                <EyeOff className="size-4" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto bg-panel p-6 sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="display text-[2rem] leading-none">
                            {editingProduct ? 'Edit product' : 'New product'}
                        </DialogTitle>
                        <DialogDescription>
                            Name, price and the options customers can pick.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="product-name" className={adminLabel}>Name</label>
                                    <input
                                        id="product-name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={adminField}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="product-image" className={adminLabel}>Image URL</label>
                                    <input
                                        id="product-image"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className={adminField}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label htmlFor="product-price" className={adminLabel}>Base price ($)</label>
                                        <input
                                            id="product-price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.basePrice}
                                            onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                                            className={cn(adminField, 'tabular-nums')}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label htmlFor="product-category" className={adminLabel}>Category</label>
                                        <select
                                            id="product-category"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className={adminField}
                                        >
                                            {categories.map(c => (
                                                <option key={c._id.toString()} value={c._id.toString()}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="product-description" className={adminLabel}>Description</label>
                                    <textarea
                                        id="product-description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className={cn(adminField, 'h-28 py-2 leading-snug')}
                                        placeholder="Tasting notes customers see on the menu"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <fieldset className="space-y-3 rounded-sm bg-slat/60 p-4">
                                    <legend className="display float-left mb-1 w-full text-[1.25rem] leading-none">Sizes</legend>
                                    <p className="clear-both text-sm text-muted-foreground">Price change is added to the base price.</p>
                                    {sizes.length === 0 && <p className="text-sm text-muted-foreground">No sizes. Customers get one standard size.</p>}
                                    {sizes.map((s, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <label htmlFor={`size-${i}-label`} className="sr-only">Size {i + 1} name</label>
                                            <input
                                                id={`size-${i}-label`}
                                                value={s.label}
                                                onChange={(e) => updateSize(i, { label: e.target.value })}
                                                placeholder="Size name"
                                                className={adminField}
                                                required
                                            />
                                            <label htmlFor={`size-${i}-price`} className="sr-only">Size {i + 1} price change in dollars</label>
                                            <input
                                                id={`size-${i}-price`}
                                                type="number"
                                                step="0.05"
                                                value={s.priceModifier}
                                                onChange={(e) => updateSize(i, { priceModifier: Number.isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber })}
                                                className={cn(adminField, 'w-24 shrink-0 tabular-nums')}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeSize(i)}
                                                className={cn(adminIconButton, 'hover:text-destructive')}
                                                aria-label={`Remove size ${s.label || i + 1}`}
                                            >
                                                <X className="size-4" aria-hidden="true" />
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addSize} className={adminOutlineButton}>
                                        <Plus className="size-4" aria-hidden="true" />
                                        Add size
                                    </button>
                                </fieldset>

                                <div className="space-y-2 rounded-sm bg-slat/60 p-4">
                                    <h3 className="display text-[1.25rem] leading-none">Add-ons</h3>
                                    <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                                        {formData.customizationOptions.addOns.map((a, i) => (
                                            <li key={i} className="flex items-center justify-between gap-2 rounded-sm bg-roast px-3 py-2 text-sm">
                                                <span>{a.label}</span>
                                                <span className="tabular-nums text-muted-foreground">+{money(a.price)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-sm bg-slat/60 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.isAvailable}
                                        onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                        className="size-5 shrink-0"
                                    />
                                    <span className="font-bold">Available to order</span>
                                </label>
                            </div>
                        </div>

                        <DialogFooter className="-mx-6 -mb-6 gap-3 bg-slat/40 p-6 sm:gap-3">
                            <button type="button" onClick={() => setIsDialogOpen(false)} className={cn(boardButtonGhost, 'flex-1')}>Cancel</button>
                            <button type="submit" className={cn(boardButtonPrimary, 'flex-1')}>
                                {editingProduct ? 'Save changes' : 'Create product'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
