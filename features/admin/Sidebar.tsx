'use client';

import { BarChart3, Coffee, Home, LayoutDashboard, List, ShoppingBag, Users } from 'lucide-react';
import WorkspaceSidebar, { type WorkspaceLink } from '@/components/layout/WorkspaceSidebar';

const links: WorkspaceLink[] = [
    { href: '/admin', label: 'Overview', icon: BarChart3 },
    { href: '/admin/products', label: 'Products', icon: ShoppingBag },
    { href: '/admin/categories', label: 'Categories', icon: List },
    { href: '/admin/orders', label: 'All orders', icon: LayoutDashboard },
    { href: '/staff', label: 'Staff board', icon: Users },
    { href: '/menu', label: 'Store view', icon: Coffee },
    { href: '/', label: 'Home', icon: Home },
];

export default function Sidebar() {
    return <WorkspaceSidebar title="Admin" links={links} />;
}
