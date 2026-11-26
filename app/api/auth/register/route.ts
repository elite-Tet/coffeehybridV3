import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/server/db';
import User from '@/server/models/User';
import { registerSchema } from '@/lib/validations/user.schema';

export async function POST(req: Request) {
    try {
        const parsed = registerSchema.safeParse(await req.json().catch(() => null));
        if (!parsed.success) {
            return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid details' }, { status: 400 });
        }
        const { name, email, password } = parsed.data;

        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // Every self-registered account is a customer. Staff/admin roles are granted
        // directly in the database by an existing admin, never from the sign-up form.
        const role = 'customer';

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        return NextResponse.json(
            { message: 'User registered successfully', userId: user._id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        const name = error instanceof Error ? error.name : '';
        const message = error instanceof Error ? error.message : '';
        
        // Check for MongoDB connection errors
        if (name === 'MongooseServerSelectionError' || message.includes('buffering timed out')) {
            return NextResponse.json(
                { message: 'Database Connection Failed. Your IP might not be whitelisted on MongoDB Atlas.' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { message: message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
