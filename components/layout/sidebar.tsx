'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    ShoppingBag,
    Warehouse,
    ArrowLeftRight,
    ClipboardList,
    Users,
    Building2,
    Settings,
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Sales Orders', href: '/sales-orders', icon: ShoppingCart },
    { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingBag },
    { name: 'Warehouses', href: '/warehouses', icon: Warehouse },
    { name: 'Transfers', href: '/transfers', icon: ArrowLeftRight },
    { name: 'Adjustments', href: '/adjustments', icon: ClipboardList },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Suppliers', href: '/suppliers', icon: Building2 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-40">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <Link href="/dashboard" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold text-foreground">Inventory Pro</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all',
                                'hover:bg-muted',
                                isActive
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                    © 2025 Inventory Pro
                </p>
            </div>
        </aside>
    );
}
