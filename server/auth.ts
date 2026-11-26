import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "./db";
import User from "@/server/models/User"; 
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
    debug: true, // Enable debugging to troubleshoot sign-in issues
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

                    // Development Fallback: If using admin mock credentials
                    if (process.env.NODE_ENV === 'development' && 
                        email === 'admin@coffee.com' && 
                        password === 'admin123') {
                        return {
                            id: 'mock-admin-id',
                            name: 'Mock Admin',
                            email: 'admin@coffee.com',
                            role: 'admin',
                            strikes: 0,
                            suspendedUntil: null
                        };
                    }

                    // Development Fallback: If using customer mock credentials
                    if (process.env.NODE_ENV === 'development' && 
                        email === 'customer@coffee.com' && 
                        password === 'customer123') {
                        return {
                            id: 'mock-customer-id',
                            name: 'Mock Customer',
                            email: 'customer@coffee.com',
                            role: 'customer',
                            strikes: 0,
                            suspendedUntil: null
                        };
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
        async signIn({ user, account }) {
            // Log sign-in attempt for debugging
            console.log("Sign-in attempt:", { user, account });
            return true;
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
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = user.role || 'customer';
                token.strikes = user.strikes || 0;
                token.suspendedUntil = user.suspendedUntil || null;
            }
            
            // Allow updating session data
            if (trigger === "update" && session?.user) {
                token.role = session.user.role;
                token.strikes = session.user.strikes;
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
