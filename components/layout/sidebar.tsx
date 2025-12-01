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
    Layers,
    Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useState } from 'react';

export const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Categories', href: '/categories', icon: Layers },
    { name: 'Sales Orders', href: '/sales-orders', icon: ShoppingCart },
    { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingBag },
    { name: 'Warehouses', href: '/warehouses', icon: Warehouse },
    { name: 'Transfers', href: '/transfers', icon: ArrowLeftRight },
    { name: 'Adjustments', href: '/adjustments', icon: ClipboardList },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Suppliers', href: '/suppliers', icon: Building2 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={cn("hidden lg:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0", className)}>
            {/* Logo */}
            <div className="h-14 flex items-center px-6 border-b border-border">
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

export function MobileSidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                    Mobile navigation menu for Inventory Pro
                </SheetDescription>
                <div className="h-14 flex items-center px-6 border-b border-border">
                    <Link href="/dashboard" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-foreground">Inventory Pro</span>
                    </Link>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setOpen(false)}
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
                <div className="p-4 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                        © 2025 Inventory Pro
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
