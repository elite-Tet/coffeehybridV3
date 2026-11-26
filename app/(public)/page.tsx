'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import DrinkCarousel from '@/components/menu/DrinkCarousel';
import PickupTicket from '@/components/order/PickupTicket';
import { ExtendedUser } from '@/types';

const STEPS = [
    { title: 'Order on your phone', body: 'Pick a drink, choose size, sugar and ice. It takes about a minute.' },
    { title: 'Show your code', body: 'You get a pickup ticket with a QR code. The barista scans it at the counter.' },
    { title: 'Take your coffee', body: 'Your drink is made when you order, so it’s ready when you walk in.' },
];

export default function LandingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const role = (session?.user as ExtendedUser | undefined)?.role;

    // Returning customers don't need the pitch — take them straight to the menu.
    useEffect(() => {
        if (role === 'customer') router.replace('/menu');
    }, [role, router]);

    return (
        <>
            <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 md:grid-cols-[1.1fr_0.9fr] md:px-6 md:pb-24 md:pt-20">
                <div className="space-y-6">
                    <h1 className="display text-5xl font-semibold leading-[1.02] md:text-7xl">
                        Skip the line, not the coffee.
                    </h1>
                    <p className="max-w-md text-lg text-muted-foreground">
                        Order ahead, walk in, show your ticket. Your drink is waiting on the counter with your name on it.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <Button asChild size="lg" className="h-12 rounded-full px-7 text-base">
                            <Link href="/menu">Start an order</Link>
                        </Button>
                        {!session && (
                            <Button asChild variant="ghost" size="lg" className="h-12 rounded-full px-5 text-base">
                                <Link href="/login">Sign in</Link>
                            </Button>
                        )}
                        {session && role !== 'customer' && (
                            <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-5 text-base">
                                <Link href={role === 'admin' ? '/admin' : '/staff'}>Open workspace</Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="mx-auto w-full max-w-sm md:-rotate-2">
                    <PickupTicket code="A27" qrValue="coffeehybrid-sample-ticket" status="ready" name="Dara" />
                    <p className="mt-4 text-center text-sm text-muted-foreground md:rotate-2">This is what your pickup ticket looks like.</p>
                </div>
            </section>

            <section id="how-it-works" aria-labelledby="how-title" className="border-y bg-card">
                <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
                    <h2 id="how-title" className="display text-3xl font-semibold md:text-4xl">How pickup works</h2>
                    <ol className="mt-10 grid gap-10 md:grid-cols-3">
                        {STEPS.map((step, i) => (
                            <li key={step.title} className="flex gap-4">
                                <span className="display flex size-10 shrink-0 items-center justify-center rounded-full bg-kraft text-lg font-semibold text-kraft-foreground" aria-hidden="true">
                                    {i + 1}
                                </span>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-medium">{step.title}</h3>
                                    <p className="text-muted-foreground">{step.body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section aria-labelledby="fair-title" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
                <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-start">
                    <h2 id="fair-title" className="display text-3xl font-semibold md:text-4xl">A fair pickup window</h2>
                    <div className="space-y-4 text-lg">
                        <p>We hold every order for <strong>30 minutes</strong>. After that it expires, so drinks don’t sit around going cold.</p>
                        <p className="text-muted-foreground">An expired order counts as a missed pickup. Miss three and ordering pauses for 24 hours. You can still browse the menu while it’s paused.</p>
                    </div>
                </div>
            </section>

            <DrinkCarousel />
        </>
    );
}
