'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import BottomTabBar from '@/components/shared/BottomTabBar';
import ActiveOrderBar from '@/components/order/ActiveOrderBar';

/** Customer chrome (top bar, phone tab bar, active-order bar). Staff and admin bring their own. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() ?? '/';
    const isWorkspace = pathname.startsWith('/admin') || pathname.startsWith('/staff');
    const isAuth = pathname === '/login' || pathname === '/register';

    if (isWorkspace) return <>{children}</>;

    return (
        <div className="flex min-h-dvh flex-col">
            <Navbar />
            <main className="flex-1 pb-[calc(var(--bottom-bar-h)+4.5rem)] md:pb-0">{children}</main>
            {!isAuth && <Footer />}
            <ActiveOrderBar />
            <BottomTabBar />
        </div>
    );
}
