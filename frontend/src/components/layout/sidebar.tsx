'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    ShoppingBag,
    Settings,
    Menu,
    Users,
    Building2,
    Layers,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    Warehouse,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { BrandLogo } from './brand-logo';
import { NavUser } from './nav-user';

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

    if (href === '/' || href === '#') {
        return current === href;
    }

    return current === href || current.startsWith(`${href}/`);
}

interface NavItem {
    name: string;
    href: string;
    icon: any;
    key?: string;
    children?: { name: string; href: string; icon?: any }[];
}

export function Sidebar({ className }: SidebarProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const t = useTranslations('common.nav');
    const tSidebar = useTranslations('common.sidebar');
    const tInv = useTranslations('inventory');

    // State for expanded menus
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    // Auto-expand if child is active
    useEffect(() => {
        const currentPath = stripLocale(pathname);
        if (currentPath.startsWith('/inventory')) {
            setExpanded(prev => ({ ...prev, 'inventory': true }));
        }
    }, [pathname]);

    const toggleExpand = (key: string) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const navigation: NavItem[] = [
        { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
        {
            name: t('inventory'),
            href: '#',
            icon: Package,
            key: 'inventory',
            children: [
                { name: tInv('tabs.stock'), href: '/inventory', icon: Package }, // List Inventory
                { name: tInv('tabs.warehouses'), href: '/inventory/warehouses', icon: Warehouse },
                { name: tInv('tabs.suppliers'), href: '/inventory/suppliers', icon: Building2 },
                { name: tInv('tabs.categories'), href: '/inventory/categories', icon: Layers },
                { name: 'Stock Ops', href: '/inventory/stock', icon: ClipboardList }, // "Stock" grouping
            ]
        },
        { name: t('sales'), href: '/sales-orders', icon: ShoppingCart },
        { name: t('purchases'), href: '/purchase-orders', icon: ShoppingBag },
        { name: t('settings'), href: '/settings', icon: Settings },
    ];

    return (
        <aside
            className={cn(
                'hidden lg:flex flex-col w-64 bg-background border-r-2 border-black h-screen sticky top-0',
                className,
            )}
        >
            {/* Logo */}
            <div className="h-20 flex items-center px-6 border-b-2 border-black">
                {/* <Link href="/dashboard" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold text-foreground">
                        {tSidebar('logo')}
                    </span>
                </Link> */}
                <BrandLogo href="/dashboard" />

            </div>
            {/* Organization Info */}
            <div className="px-6 py-4 border-b-2 border-black bg-muted/30">
                <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-none border-2 border-black bg-primary">
                        <Building2 className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h2 className="text-sm font-bold text-foreground truncate uppercase tracking-tighter">
                            {user?.organizationName || tSidebar('defaultOrg')}
                        </h2>
                        <p className="text-[10px] font-medium text-muted-foreground truncate uppercase">
                            {user?.role || (user ? tSidebar('member') : tSidebar('guest'))}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    if (item.children) {
                        const isExpanded = expanded[item.key || item.name];
                        const isChildActive = item.children.some(child => isLinkActive(pathname, child.href));

                        return (
                            <div key={item.name} className="space-y-1">
                                <button
                                    onClick={() => toggleExpand(item.key || item.name)}
                                    className={cn(
                                        'w-full flex items-center justify-between px-4 py-3 rounded-none transition-all border-2',
                                        isChildActive
                                            ? 'border-black bg-muted' // Parent active style
                                            : 'border-transparent hover:bg-muted hover:border-black text-foreground'
                                    )}
                                >
                                    <div className="flex items-center space-x-3">
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.name}</span>
                                    </div>
                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>

                                {isExpanded && (
                                    <div className="pl-6 space-y-1 border-l-2 border-black ml-4 mb-2">
                                        {item.children.map(child => {
                                            let active = isLinkActive(pathname, child.href);

                                            // Special handling for root inventory path to strictness
                                            // If current path matches another sibling (e.g. /inventory/warehouses), 
                                            // don't mark /inventory as active unless it's exact match
                                            if (child.href === '/inventory' && active) {
                                                const current = stripLocale(pathname);
                                                // Check if any *other* sibling is active
                                                const isOtherSiblingActive = item.children?.some(sibling =>
                                                    sibling.href !== '/inventory' && isLinkActive(pathname, sibling.href)
                                                );

                                                if (isOtherSiblingActive && current !== '/inventory') {
                                                    active = false;
                                                }
                                            }

                                            return (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    className={cn(
                                                        'flex items-center space-x-3 px-4 py-2 text-sm rounded-none transition-all border-2',
                                                        active
                                                            ? 'bg-primary text-primary-foreground border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                                            : 'text-foreground border-transparent hover:bg-muted hover:border-black',
                                                    )}
                                                >
                                                    {child.icon && <child.icon className="w-4 h-4" />}
                                                    <span>{child.name}</span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    const active = isLinkActive(pathname, item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center space-x-3 px-4 py-3 rounded-none transition-all border-2',
                                active
                                    ? 'bg-primary text-primary-foreground border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                    : 'text-foreground border-transparent hover:bg-muted hover:border-black',
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="mt-auto border-t-2 border-black p-4">
                <NavUser />
                <div className="pt-4">
                    <p className="text-xs text-muted-foreground text-center">
                        {tSidebar('footer')}
                    </p>
                </div>
            </div>
        </aside>
    );
}

export function MobileSidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const t = useTranslations('common.nav');
    const tSidebar = useTranslations('common.sidebar');
    const tInv = useTranslations('inventory');

    // State for expanded menus
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    // Auto-expand if child is active
    useEffect(() => {
        const currentPath = stripLocale(pathname);
        if (currentPath.startsWith('/inventory')) {
            setExpanded(prev => ({ ...prev, 'inventory': true }));
        }
    }, [pathname]);

    const toggleExpand = (key: string) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const navigation = [
        { name: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
        {
            name: t('inventory'),
            href: '#',
            icon: Package,
            key: 'inventory',
            children: [
                { name: tInv('tabs.stock'), href: '/inventory', icon: Package }, // List
                { name: tInv('tabs.warehouses'), href: '/inventory/warehouses', icon: Warehouse },
                { name: tInv('tabs.suppliers'), href: '/inventory/suppliers', icon: Building2 },
                { name: tInv('tabs.categories'), href: '/inventory/categories', icon: Layers },
                { name: 'Stock Ops', href: '/inventory/stock', icon: ClipboardList }, // Stock
            ]
        },
        { name: t('sales'), href: '/sales-orders', icon: ShoppingCart },
        { name: t('purchases'), href: '/purchase-orders', icon: ShoppingBag },
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
            <SheetContent side="left" className="w-64 p-0 flex flex-col h-full">
                <SheetTitle className="sr-only">{tSidebar('navMenu')}</SheetTitle>
                <SheetDescription className="sr-only">
                    {tSidebar('mobileNavDesc')}
                </SheetDescription>

                {/* Logo */}
                <div className="h-14 flex items-center px-6 border-b-2 border-black">
                    {/* <Link
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
                    </Link> */}
                    <BrandLogo href='/dashboard' onClick={() => setOpen(false)} />

                </div>

                {/* Organization Info */}
                <div className="px-6 py-4 border-b-2 border-black bg-muted/30">
                    <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-none border-2 border-black bg-primary">
                            <Building2 className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h2 className="text-sm font-bold text-foreground truncate uppercase tracking-tighter">
                                {user?.organizationName || tSidebar('defaultOrg')}
                            </h2>
                            <p className="text-[10px] font-medium text-muted-foreground truncate uppercase">
                                {user?.role || (user ? tSidebar('member') : tSidebar('guest'))}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        if (item.children) {
                            const isExpanded = expanded[item.key || item.name];
                            const isChildActive = item.children.some(child => isLinkActive(pathname, child.href));

                            return (
                                <div key={item.name} className="space-y-1">
                                    <button
                                        onClick={() => toggleExpand(item.key || item.name)}
                                        className={cn(
                                            'w-full flex items-center justify-between px-4 py-3 rounded-none transition-all border-2',
                                            isChildActive
                                                ? 'border-black bg-muted' // Parent active style
                                                : 'border-transparent hover:bg-muted hover:border-black text-foreground'
                                        )}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.name}</span>
                                        </div>
                                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </button>

                                    {isExpanded && (
                                        <div className="pl-6 space-y-1 border-l-2 border-black ml-4 mb-2">
                                            {item.children.map(child => {
                                                let active = isLinkActive(pathname, child.href);

                                                // Special handling for root inventory path
                                                if (child.href === '/inventory' && active) {
                                                    const current = stripLocale(pathname);
                                                    const isOtherSiblingActive = item.children?.some(sibling =>
                                                        sibling.href !== '/inventory' && isLinkActive(pathname, sibling.href)
                                                    );

                                                    if (isOtherSiblingActive && current !== '/inventory') {
                                                        active = false;
                                                    }
                                                }

                                                return (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        onClick={() => setOpen(false)}
                                                        className={cn(
                                                            'flex items-center space-x-3 px-4 py-2 text-sm rounded-none transition-all border-2',
                                                            active
                                                                ? 'bg-primary text-primary-foreground border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                                                : 'text-foreground border-transparent hover:bg-muted hover:border-black',
                                                        )}
                                                    >
                                                        {child.icon && <child.icon className="w-4 h-4" />}
                                                        <span>{child.name}</span>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        const active = isLinkActive(pathname, item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                    'flex items-center space-x-3 px-4 py-3 rounded-none transition-all border-2',
                                    active
                                        ? 'bg-primary text-primary-foreground border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                        : 'text-foreground border-transparent hover:bg-muted hover:border-black',
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>



                {/* Footer */}
                <div className='mt-auto border-t-2 border-black p-4'>
                    <NavUser />
                    <div className="pt-4">
                        <p className="text-xs text-muted-foreground text-center">
                            {tSidebar('footer')}
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
