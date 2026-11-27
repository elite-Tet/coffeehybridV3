'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LogOut, Menu, type LucideIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Logo from '@/components/layout/Logo';
import { cn } from '@/lib/utils';

export type WorkspaceLink = { href: string; label: string; icon: LucideIcon };

interface WorkspaceSidebarProps {
    /** Workspace name shown under the wordmark, e.g. "Staff" or "Admin". */
    title: string;
    links: WorkspaceLink[];
}

function NavLinks({ links, pathname, onNavigate }: { links: WorkspaceLink[]; pathname: string; onNavigate?: () => void }) {
    return (
        <ul className="space-y-1">
            {links.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                    <li key={href}>
                        <Link
                            href={href}
                            onClick={onNavigate}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'relative flex min-h-11 items-center gap-3 rounded-sm px-3 text-base transition-colors',
                                active
                                    ? 'bg-panel font-bold text-foreground before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-sm before:bg-signal'
                                    : 'text-muted-foreground hover:bg-panel/60 hover:text-foreground'
                            )}
                        >
                            <Icon className="size-5 shrink-0" aria-hidden="true" />
                            {label}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

function SignOutButton() {
    return (
        <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex min-h-11 w-full items-center gap-3 rounded-sm px-3 text-base text-muted-foreground transition-colors hover:bg-panel/60 hover:text-foreground"
        >
            <LogOut className="size-5 shrink-0" aria-hidden="true" />
            Sign out
        </button>
    );
}

/**
 * Side navigation for the staff and admin workspaces, in the board style:
 * wordmark, workspace name in the display face, squared links with a signal bar
 * on the current page. On phones it collapses into a top bar with a sheet.
 */
export default function WorkspaceSidebar({ title, links }: WorkspaceSidebarProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <>
            <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar px-4 py-6 lg:flex">
                <div className="px-3">
                    <Logo />
                    <p className="display mt-1 text-[1.25rem] tracking-[0.04em] text-muted-foreground">{title}</p>
                </div>
                <nav aria-label={`${title} workspace`} className="mt-8 flex-1">
                    <NavLinks links={links} pathname={pathname} />
                </nav>
                <SignOutButton />
            </aside>

            <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between gap-3 bg-sidebar/95 px-4 backdrop-blur-sm lg:hidden">
                <div className="flex items-baseline gap-3">
                    <Logo className="text-[1.5rem]" />
                    <span className="display text-[1.125rem] tracking-[0.04em] text-muted-foreground">{title}</span>
                </div>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <button
                            type="button"
                            className="inline-flex min-h-11 items-center gap-2 rounded-sm px-3 text-base text-foreground transition-colors hover:bg-panel"
                        >
                            <Menu className="size-5" aria-hidden="true" />
                            Menu
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85%] max-w-xs bg-sidebar">
                        <SheetHeader className="text-left">
                            <SheetTitle className="display text-[2rem]">{title}</SheetTitle>
                            <SheetDescription>Workspace pages</SheetDescription>
                        </SheetHeader>
                        <nav aria-label={`${title} workspace`} className="flex-1 px-4">
                            <NavLinks links={links} pathname={pathname} onNavigate={() => setOpen(false)} />
                        </nav>
                        <div className="px-4 pb-6">
                            <SignOutButton />
                        </div>
                    </SheetContent>
                </Sheet>
            </header>
        </>
    );
}
