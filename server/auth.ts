import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dbConnect from "./db";
import User from "@/server/models/User"; 
import { findOrCreateGoogleUser } from "./google-user";
import { Role } from "@/types";

// Type augmentation for NextAuth v5
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role: Role;
            strikes: number;
            suspendedUntil: Date | null;
        };
    }
    interface User {
        role?: Role;
        strikes?: number;
        suspendedUntil?: Date | null;
    }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
    // Verbose Auth.js logs only when explicitly requested (they include user details)
    debug: process.env.AUTH_DEBUG === 'true',
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                try {
                    const email = credentials?.email;
                    const password = credentials?.password;
                    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
                        return null;
                    }

                    await dbConnect();
                    
                    const user = await User.findOne({ email });

                    if (!user) {
                        return null;
                    }

                    // If user has no password (e.g. Google auth only), fail credentials login
                    if (!user.password) {
                        return null; 
                    }

                    const isPasswordValid = await bcrypt.compare(
                        password,
                        user.password
                    );

                    if (!isPasswordValid) {
                        return null;
                    }

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        strikes: user.strikes || 0,
                        suspendedUntil: user.suspendedUntil || null
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        // Accounts are matched by email, so only accept addresses Google has verified.
        signIn({ account, profile }) {
            return account?.provider !== 'google' || profile?.email_verified === true;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub || (token.id as string) || '1';
                session.user.role = (token.role as Role) || 'customer';
                session.user.strikes = (token.strikes as number) || 0;
                session.user.suspendedUntil = (token.suspendedUntil as Date) || null;
            }
            return session;
        },
        async jwt({ token, user, account, trigger }) {
            if (user) {
                token.id = user.id;
                token.role = user.role || 'customer';
                token.strikes = user.strikes || 0;
                token.suspendedUntil = user.suspendedUntil || null;
            }

            // Google's user object has no database record behind it. Swap in ours, so
            // orders, roles and strikes work the same as for email sign-in.
            if (account?.provider === 'google' && user?.email) {
                const dbUser = await findOrCreateGoogleUser({ email: user.email, name: user.name, image: user.image });
                token.id = token.sub = dbUser!._id.toString();
                token.role = dbUser!.role;
                token.strikes = dbUser!.strikes || 0;
                token.suspendedUntil = dbUser!.suspendedUntil || null;
            }
            
            // session.update() can be called from the browser, so never trust its payload:
            // re-read role and strike state from the database instead.
            if (trigger === "update" && typeof token.id === "string" && mongoose.isValidObjectId(token.id)) {
                await dbConnect();
                const fresh = await User.findById(token.id).select("role strikes suspendedUntil").lean();
                if (fresh) {
                    token.role = fresh.role;
                    token.strikes = fresh.strikes || 0;
                    token.suspendedUntil = fresh.suspendedUntil || null;
                }
            }
            
            return token;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login", // Redirect errors back to login
    },
    session: {
        strategy: "jwt", // Use JWT instead of database sessions
    },
});
