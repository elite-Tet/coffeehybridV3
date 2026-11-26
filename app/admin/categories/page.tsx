'use client';

import { useState, useEffect } from 'react';
import { ICategory } from '@/types';
import { EyeOff, Loader2, Pencil, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { boardButtonGhost, boardButtonPrimary } from '@/components/layout/board-styles';
import { adminField, adminIconButton, adminLabel, adminPanel } from '@/features/admin/admin-styles';
import { cn } from '@/lib/utils';

export default function CategoryManagement() {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sortOrder: 0,
        isActive: true
    });

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            if (data.success) setCategories(data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openCreateDialog = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '', sortOrder: categories.length, isActive: true });
        setIsDialogOpen(true);
    };

    const openEditDialog = (category: ICategory) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            sortOrder: category.sortOrder,
            isActive: category.isActive
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories';
        const method = editingCategory ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Category ${editingCategory ? 'updated' : 'created'}`);
                fetchCategories();
                setIsDialogOpen(false);
            } else {
                toast.error(data.error);
            }
        } catch {
            toast.error('Something went wrong');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will deactivate the category.')) return;
        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Category deactivated');
                fetchCategories();
            }
        } catch {
            toast.error('Failed to deactivate category');
        }
    };

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center" role="status">
                <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="sr-only">Loading categories</span>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="display text-section">Categories</h1>
                    <p className="mt-2 text-muted-foreground">Groups on the menu, shown in sort order.</p>
                </div>
                <button type="button" onClick={openCreateDialog} className={boardButtonPrimary}>
                    <Plus className="size-5" aria-hidden="true" />
                    New category
                </button>
            </header>

            <div className="relative mt-8 max-w-md">
                <label htmlFor="category-search" className="sr-only">Search categories</label>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                    id="category-search"
                    type="search"
                    placeholder="Search categories"
                    className={cn(adminField, 'pl-9')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filtered.length === 0 ? (
                <p className="mt-6 rounded-xl border-2 border-dashed border-slat px-4 py-10 text-center text-muted-foreground">
                    {categories.length === 0 ? 'No categories yet.' : `No categories match “${searchQuery}”.`}
                </p>
            ) : (
                <ul className={cn(adminPanel, 'mt-6 space-y-1.5 p-3')}>
                    {filtered.map((category) => (
                        <li key={category._id.toString()} className="flex items-center gap-4 rounded-sm bg-slat px-4 py-3">
                            <span className="display w-10 shrink-0 text-center text-[1.75rem] tabular-nums text-muted-foreground">
                                <span className="sr-only">Sort order </span>{category.sortOrder}
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <h2 className="display text-[1.5rem] leading-none">{category.name}</h2>
                                    {!category.isActive && (
                                        <span className="rounded-sm bg-st-expired/12 px-2 py-0.5 text-sm font-bold">Hidden</span>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">{category.description || 'No description'}</p>
                            </div>
                            <div className="flex shrink-0">
                                <button type="button" className={adminIconButton} onClick={() => openEditDialog(category)} aria-label={`Edit ${category.name}`}>
                                    <Pencil className="size-4" aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    className={cn(adminIconButton, 'hover:text-destructive')}
                                    onClick={() => handleDelete(category._id.toString())}
                                    aria-label={`Hide ${category.name}`}
                                >
                                    <EyeOff className="size-4" aria-hidden="true" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-panel p-6 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="display text-[2rem] leading-none">
                            {editingCategory ? 'Edit category' : 'New category'}
                        </DialogTitle>
                        <DialogDescription>
                            A group of drinks on the menu.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label htmlFor="name" className={adminLabel}>Name</label>
                            <input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Espresso"
                                className={adminField}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="description" className={adminLabel}>Description</label>
                            <input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Short line under the heading on the menu"
                                className={adminField}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="sortOrder" className={adminLabel}>Sort order</label>
                            <input
                                id="sortOrder"
                                type="number"
                                value={formData.sortOrder}
                                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                                className={cn(adminField, 'w-28 tabular-nums')}
                                aria-describedby="sortOrder-hint"
                            />
                            <p id="sortOrder-hint" className="text-sm text-muted-foreground">Lower numbers come first.</p>
                        </div>
                        <label htmlFor="isActive" className="flex min-h-11 cursor-pointer items-center gap-3 rounded-sm bg-slat/60 px-4 py-3">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="size-5 shrink-0"
                            />
                            <span className="font-bold">Show on the menu</span>
                        </label>
                        <DialogFooter className="gap-3 pt-2 sm:gap-3">
                            <button type="button" onClick={() => setIsDialogOpen(false)} className={cn(boardButtonGhost, 'flex-1')}>Cancel</button>
                            <button type="submit" className={cn(boardButtonPrimary, 'flex-1')}>
                                {editingCategory ? 'Save changes' : 'Create category'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
