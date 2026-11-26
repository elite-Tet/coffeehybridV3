import Link from 'next/link';
import Logo from '@/components/layout/Logo';
import { ROUTES } from '@/lib/routes';

const linkClass = 'inline-flex min-h-11 items-center text-muted-foreground transition-colors hover:text-foreground hover:underline';

export default function SiteFooter() {
    return (
        <footer className="mt-24 border-t-2 border-slat text-sm text-muted-foreground">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-[2fr_1fr_1fr] md:px-12">
                <div>
                    <Logo />
                    <p className="mt-2">Open daily, 7:00 to 19:00.</p>
                </div>

                <nav aria-label="Order">
                    <ul className="grid">
                        <li><Link href={ROUTES.MENU} className={linkClass}>Menu</Link></li>
                        <li><Link href="/history" className={linkClass}>Your orders</Link></li>
                        <li><Link href={ROUTES.LOGIN} className={linkClass}>Sign in</Link></li>
                    </ul>
                </nav>

                <nav aria-label="About">
                    <ul className="grid">
                        <li><Link href="/#how-it-works" className={linkClass}>How pickup works</Link></li>
                        <li><Link href="/register" className={linkClass}>Create an account</Link></li>
                    </ul>
                </nav>
            </div>
            <p className="mx-auto max-w-7xl px-4 pb-8 text-xs md:px-12">© {new Date().getFullYear()} CoffeeHybrid</p>
        </footer>
    );
}
