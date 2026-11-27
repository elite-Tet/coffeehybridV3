'use client';

import { Coffee, Home, LayoutDashboard, QrCode } from 'lucide-react';
import WorkspaceSidebar, { type WorkspaceLink } from '@/components/layout/WorkspaceSidebar';

const links: WorkspaceLink[] = [
    { href: '/staff', label: 'Order board', icon: LayoutDashboard },
    { href: '/staff/scan', label: 'Scan pickups', icon: QrCode },
    { href: '/menu', label: 'Store view', icon: Coffee },
    { href: '/', label: 'Home', icon: Home },
];

export default function Sidebar() {
    return <WorkspaceSidebar title="Staff" links={links} />;
}
