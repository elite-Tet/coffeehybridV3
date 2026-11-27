import dbConnect from './db';
import User from '@/server/models/User';
import { Role } from '@/types';

interface GoogleProfile {
    email: string;
    name?: string | null;
    image?: string | null;
}

/**
 * Find the account for a Google sign-in, creating a customer on the first visit.
 * An existing account keeps its name, password, role and strikes.
 */
export async function findOrCreateGoogleUser({ email, name, image }: GoogleProfile) {
    await dbConnect();
    return User.findOneAndUpdate(
        { email },
        { $setOnInsert: { email, name: name || email.split('@')[0], image: image ?? undefined, role: 'customer' } },
        { upsert: true, returnDocument: 'after', runValidators: true },
    ).lean<{ _id: { toString(): string }; role: Role; strikes?: number; suspendedUntil?: Date | null }>();
}
