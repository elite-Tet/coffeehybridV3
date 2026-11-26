// Admin-only: upserts the sample menu (categories + products) from lib/mock-data.ts.
// Usage (signed in as admin): fetch('/api/admin/seed', { method: 'POST' })

import { NextResponse } from 'next/server';
import dbConnect from '@/server/db';
import Product from '@/server/models/Product';
import Category from '@/server/models/Category';
import { mockProducts } from '@/lib/mock-data';
import { requireRole } from '@/server/require-role';

// POST, not GET: it writes to the database, so it must not be triggerable by a link or prefetch.
export const POST = async () => {
    const check = await requireRole(['admin']);
    if (!check.ok) return check.response;

    try {
        await dbConnect();
        
        console.log('Starting Force Product Update/Seed...');

        // 1. Ensure Categories exist
        const uniqueCategories = Array.from(new Set(mockProducts.map(p => p.category.name)));
        const categoryMap = new Map();

        for (const catName of uniqueCategories) {
            let category = await Category.findOne({ name: catName });
            if (!category) {
                console.log(`Creating category: ${catName}`);
                category = await Category.create({
                    name: catName,
                    slug: catName.toLowerCase().replace(/\s+/g, '-'),
                    isActive: true
                });
            }
            categoryMap.set(catName, category._id);
        }

        // 2. Upsert Products
        const results = [];
        for (const p of mockProducts) {
            const categoryId = categoryMap.get(p.category.name);
            
            // Check if product exists by name
            let existingProduct = await Product.findOne({ name: p.name });

            const productData = {
                name: p.name,
                description: p.description,
                basePrice: p.basePrice,
                imageUrl: p.imageUrl, // Ensure image URL is updated
                category: categoryId,
                isAvailable: p.isAvailable,
                customizationOptions: p.customizationOptions
            };

            if (existingProduct) {
                console.log(`Updating existing product: ${p.name}`);
                // Update with new data (especially Image URL)
                existingProduct = await Product.findByIdAndUpdate(
                   existingProduct._id,
                   { $set: productData },
                   { new: true }
                );
                results.push({ name: p.name, status: 'updated' });
            } else {
                console.log(`Creating new product: ${p.name}`);
                await Product.create(productData);
                results.push({ name: p.name, status: 'created' });
            }
        }

        return NextResponse.json({ success: true, message: "Products updated successfully", data: results });
    } catch (error) {
        console.error('Seed Error:', error);
        const message = error instanceof Error ? error.message : 'Seed failed';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
};
