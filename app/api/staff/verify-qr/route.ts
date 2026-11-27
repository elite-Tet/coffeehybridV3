import { NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import dbConnect from '@/server/db';
import Order from '@/server/models/Order';
import User from '@/server/models/User';
import Strike from '@/server/models/Strike';
import { ExtendedUser } from '@/types';
import { isExpired } from '@/lib/qr';
import { applyStrike } from '@/lib/strikes';

export const POST = async (req: Request) => {
    try {
        const session = await auth();
        const role = (session?.user as ExtendedUser | undefined)?.role;
        if (!role || !['staff', 'admin'].includes(role)) {
            return NextResponse.json({ success: false, error: 'Unauthorized personnel only' }, { status: 403 });
        }

        await dbConnect();
        const body = await req.json().catch(() => ({}));
        const qrCode = typeof body.qrCode === 'string' ? body.qrCode : '';
        const orderCode = typeof body.orderCode === 'string' ? body.orderCode.trim() : '';

        let order;
        if (qrCode) {
            order = await Order.findOne({ qrCode }).populate('user');
            if (!order) {
                return NextResponse.json({ success: false, error: 'Invalid QR Code' }, { status: 404 });
            }
        } else if (orderCode) {
            // Fallback when the camera can't scan: the 4-character code printed on the customer's
            // ticket (last 4 hex chars of the order id). Only active orders are searched.
            if (!/^[0-9a-f]{4}$/i.test(orderCode)) {
                return NextResponse.json({ success: false, error: 'Order codes are 4 letters or numbers, like 49CC' }, { status: 400 });
            }
            const matches = await Order.find({
                status: { $in: ['pending', 'confirmed', 'ready'] },
                $expr: { $regexMatch: { input: { $toString: '$_id' }, regex: `${orderCode}$`, options: 'i' } },
            })
                .limit(2)
                .populate('user');
            if (matches.length === 0) {
                return NextResponse.json({ success: false, error: `No active order with code ${orderCode.toUpperCase()}` }, { status: 404 });
            }
            if (matches.length > 1) {
                return NextResponse.json({ success: false, error: 'Two active orders share that code. Scan the QR code instead.' }, { status: 409 });
            }
            order = matches[0];
        } else {
            return NextResponse.json({ success: false, error: 'Scan a QR code or type the order code' }, { status: 400 });
        }

        if (order.status === 'completed') {
            return NextResponse.json({ success: false, error: 'Order already picked up' }, { status: 400 });
        }

        if (order.status === 'cancelled') {
            return NextResponse.json({ success: false, error: 'Order was cancelled' }, { status: 400 });
        }

        const orderIsExpired = isExpired(order.expiresAt);

        if (orderIsExpired || order.status === 'expired') {
            // Handle no-show strike logic if not already done by cron
            if (order.status !== 'expired') {
                order.status = 'expired';
                await order.save();

                // Add strike to user
                if (order.user) {
                    // FIX: Replaced 'any' with proper type casting using Types.ObjectId
                    const userId = typeof order.user === 'object' ? order.user._id : order.user;
                    await Strike.create({ user: userId, order: order._id, reason: 'Missed pickup window (Staff scanned expired)' });

                    const user = await User.findById(userId);
                    if (user) {
                        applyStrike(user);
                        await user.save();
                    }
                }
            }
            return NextResponse.json({ success: false, error: 'Order expired. Pickup window closed.', data: order }, { status: 400 });
        }

        // Successfully verified and picked up!
        order.status = 'completed';
        order.qrUsed = true;
        await order.save();

        return NextResponse.json({
            success: true,
            message: 'Order verified successfully',
            data: order
        });

    } catch (error: unknown) {
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
};
