import { NextResponse } from 'next/server';
import dbConnect from '@/server/db';
import Category from '@/server/models/Category';
import { requireRole } from '@/server/require-role';

export const GET = async () => {
    try {
        await dbConnect();
        const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });
        return NextResponse.json({ success: true, data: categories });
    } catch (error) {
        console.error('GET /api/categories failed:', error);
        return NextResponse.json({ success: false, error: 'Categories are unavailable right now' }, { status: 503 });
    }
};

export const POST = async (req: Request) => {
    const check = await requireRole(['admin']);
    if (!check.ok) return check.response;

    try {
        await dbConnect();
        const body = await req.json();
        const category = await Category.create(body);
        return NextResponse.json({ success: true, data: category }, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 400 });
    }
};
