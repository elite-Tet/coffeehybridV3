import { z } from 'zod';

/** Shape of POST /api/auth/register. Role is never accepted from the client. */
export const registerSchema = z.object({
    name: z.string().trim().min(1, 'Enter your name').max(60, 'Name is too long'),
    // Trimmed but not lowercased: login matches the stored email exactly.
    email: z.string().trim().pipe(z.email('Enter a valid email address')),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password is too long'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
