import { NextResponse } from 'next/server';
import dbConnect from '@/server/db';
import Product from '@/server/models/Product';
import Category from '@/server/models/Category';
import { requireRole } from '@/server/require-role';

export const GET = async () => {
    try {
        await dbConnect();
        // Only available products, newest first. An empty menu is returned as an empty list;
        // seed sample data explicitly with POST /api/admin/seed (admin only).
        const products = await Product.find({ isAvailable: true }).populate({ path: 'category', model: Category }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        console.error('GET /api/products failed:', error);
        return NextResponse.json({ success: false, error: 'Menu is unavailable right now' }, { status: 503 });
    }
};

export const POST = async (req: Request) => {
    const check = await requireRole(['admin']);
    if (!check.ok) return check.response;

    try {
        await dbConnect();
        const body = await req.json();
        const product = await Product.create(body);
        return NextResponse.json({ success: true, data: product }, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
};
