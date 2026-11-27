import { redirect } from 'next/navigation';
import { auth } from '@/server/auth';
import { ExtendedUser } from '@/types';
import Sidebar from '@/features/admin/Sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    const role = (session?.user as ExtendedUser | undefined)?.role;

    if (role !== 'admin') {
        redirect('/login');
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <Sidebar />
            <main id="main" tabIndex={-1} className="min-w-0 flex-1 px-4 pb-16 pt-24 outline-none md:px-8 lg:pt-10">
                {children}
            </main>
        </div>
    );
}
