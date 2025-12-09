'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

// Helper: buang prefix locale `/en` atau `/id` dari pathname
function stripLocale(pathname: string | null): string {
    if (!pathname) return '/';
    const match = pathname.match(/^\/(en|id)(\/.*)?$/);
    if (match) {
        return match[2] || '/';
    }
    return pathname;
}

// Helper: cek apakah link sedang aktif (support locale prefix)
function isLinkActive(pathname: string | null, href: string): boolean {
    const current = stripLocale(pathname);

    if (href === '/') {
        return current === '/';
    }

    return current === href || current.startsWith(`${href}/`);
}

export function Sidebar({ className }: SidebarProps) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const t = useTranslations('common.nav');
    const tSidebar = useTranslations('common.sidebar');

    const navigation = [
        { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
        { name: t('inventory'), href: '/inventory', icon: Package },
        // { name: t('categories'), href: '/categories', icon: Layers },
        { name: t('sales'), href: '/sales-orders', icon: ShoppingCart },
        { name: t('purchases'), href: '/purchase-orders', icon: ShoppingBag },


        // { name: t('customers'), href: '/customers', icon: Users },
        // { name: t('suppliers'), href: '/suppliers', icon: Building2 },
        { name: t('settings'), href: '/settings', icon: Settings },
    ];

    return (
        <aside
            className={cn(
                'hidden lg:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0',
                className,
            )}
        >
            {/* Logo */}
            <div className="h-14 flex items-center px-6 border-b border-border">
                <Link href="/dashboard" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold text-foreground">
                        {tSidebar('logo')}
                    </span>
                </Link>
            </div>

            {/* Organization Info */}
            <div className="px-4 py-4 border-b border-border">
                <div className="flex flex-col">
                    <h2 className="text-sm font-semibold text-foreground truncate">
                        {session?.user?.organizationName || tSidebar('defaultOrg')}
                    </h2>
                    <p className="text-xs text-muted-foreground truncate">
                        {session?.user?.roleName || tSidebar('guest')}
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const active = isLinkActive(pathname, item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all',
                                'hover:bg-muted',
                                active
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-muted-foreground hover:text-foreground',
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
                    {tSidebar('footer')}
                </p>
            </div>
        </aside>
    );
}

export function MobileSidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const t = useTranslations('common.nav');
    const tSidebar = useTranslations('common.sidebar');

    const navigation = [
        { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
        { name: t('inventory'), href: '/inventory', icon: Package },
        // { name: t('categories'), href: '/categories', icon: Layers },
        { name: t('sales'), href: '/sales-orders', icon: ShoppingCart },
        { name: t('purchases'), href: '/purchase-orders', icon: ShoppingBag },


        { name: t('customers'), href: '/customers', icon: Users },
        { name: t('suppliers'), href: '/suppliers', icon: Building2 },
        { name: t('settings'), href: '/settings', icon: Settings },
    ];

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                    <span className="sr-only">{tSidebar('toggleMenu')}</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">{tSidebar('navMenu')}</SheetTitle>
                <SheetDescription className="sr-only">
                    {tSidebar('mobileNavDesc')}
                </SheetDescription>

                {/* Logo */}
                <div className="h-14 flex items-center px-6 border-b border-border">
                    <Link
                        href="/dashboard"
                        className="flex items-center space-x-2"
                        onClick={() => setOpen(false)}
                    >
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold text-foreground">
                            {tSidebar('logo')}
                        </span>
                    </Link>
                </div>

                {/* Organization Info */}
                <div className="px-4 py-4 border-b border-border">
                    <div className="flex flex-col">
                        <h2 className="text-sm font-semibold text-foreground truncate">
                            {session?.user?.organizationName || tSidebar('defaultOrg')}
                        </h2>
                        <p className="text-xs text-muted-foreground truncate">
                            {session?.user?.roleName || tSidebar('guest')}
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const active = isLinkActive(pathname, item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all',
                                    'hover:bg-muted',
                                    active
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-muted-foreground hover:text-foreground',
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
                        {tSidebar('footer')}
                    </p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
