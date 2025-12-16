'use client';

import { useAuth } from '@/providers/auth-provider';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { User, LogOut, ChevronDown, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { MobileSidebar } from './sidebar';
import { useTranslations } from 'next-intl';

import { usePathname } from 'next/navigation';

export function Topbar() {
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const t = useTranslations('common.topbar');
    const tNav = useTranslations('common.nav');
    const pathname = usePathname();

    const getPageTitle = (path: string | null) => {
        if (!path) return tNav('dashboard');
        // Strip locale
        const cleanPath = path.replace(/^\/(en|id)/, '') || '/';

        if (cleanPath === '/' || cleanPath === '/dashboard') return tNav('dashboard');
        if (cleanPath.startsWith('/inventory')) return tNav('inventory');
        if (cleanPath.startsWith('/sales-orders')) return tNav('sales');
        if (cleanPath.startsWith('/purchase-orders')) return tNav('purchases');
        if (cleanPath.startsWith('/warehouses')) return tNav('warehouses');
        if (cleanPath.startsWith('/categories')) return tNav('categories');
        if (cleanPath.startsWith('/customers')) return tNav('customers');
        if (cleanPath.startsWith('/suppliers')) return tNav('suppliers');
        if (cleanPath.startsWith('/settings')) return tNav('settings');

        return tNav('dashboard');
    };

    return (
        <header className="h-14 bg-background border-b-2 border-black flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                {/* Mobile Menu */}
                <MobileSidebar />

                {/* Page Title */}
                <div>
                    <h1 className="text-lg font-semibold text-foreground">
                        {getPageTitle(pathname)}
                    </h1>
                </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Help Button */}
                <Link href="/help" title="Help / Panduan">
                    <button className="p-2 rounded-md hover:bg-muted transition-colors">
                        <HelpCircle className="w-5 h-5 text-muted-foreground" />
                    </button>
                </Link>

                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Menu */}
                {user && (
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <User className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-medium text-foreground">
                                    {user.email}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {user.role}
                                </p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                        </button>

                        {/* Dropdown */}
                        {showDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowDropdown(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                                    <div className="p-2">
                                        <button
                                            onClick={logout}
                                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>{t('logout')}</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
