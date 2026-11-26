import 'server-only';
import dbConnect from '@/server/db';
import Product from '@/server/models/Product';

export type MenuPreviewItem = {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
};

/**
 * Drinks for the homepage "On the bar today" list, read straight from the database
 * (the old carousel used hard-coded mock data). Returns [] if the database is
 * unreachable, so the homepage still renders.
 */
export async function getMenuPreview(limit = 6): Promise<MenuPreviewItem[]> {
    try {
        await dbConnect();
        const products = await Product.find({ isAvailable: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('name basePrice imageUrl')
            .lean();

        return products.map((p) => ({
            id: String(p._id),
            name: p.name,
            price: p.basePrice,
            imageUrl: p.imageUrl,
        }));
    } catch (error) {
        console.error('Homepage menu preview failed:', error);
        return [];
    }
}
