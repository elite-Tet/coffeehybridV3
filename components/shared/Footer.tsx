import Link from 'next/link';
import Logo from '@/components/shared/Logo';
import { LEGAL_LINKS, ROUTES } from '@/lib/routes';

export default function Footer() {
    return (
        <footer className="mt-24 border-t">
            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[2fr_1fr] md:px-6">
                <div className="space-y-3">
                    <Logo />
                    <p className="max-w-xs text-sm text-muted-foreground">
                        Order on your phone, show your code at the counter, and take your coffee. No line.
                    </p>
                </div>

                <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
                    <Link href={ROUTES.MENU} className="text-muted-foreground hover:text-foreground">Menu</Link>
                    <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground">How pickup works</Link>
                    <a href={LEGAL_LINKS.PRIVACY} className="text-muted-foreground hover:text-foreground">Privacy</a>
                    <a href={LEGAL_LINKS.TERMS} className="text-muted-foreground hover:text-foreground">Terms</a>
                </nav>
            </div>
            <p className="mx-auto max-w-6xl px-4 pb-8 text-xs text-muted-foreground md:px-6">© {new Date().getFullYear()} CoffeeHybrid</p>
        </footer>
    );
}
