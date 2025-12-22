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
        <header className="h-20 bg-background border-b-2 border-black flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
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
                    <button className="p-2 rounded-md hover:bg-muted transition-colors border-2 border-transparent hover:border-black">
                        <HelpCircle className="w-5 h-5 text-muted-foreground" />
                    </button>
                </Link>

                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Theme Toggle */}
                <ThemeToggle />
            </div>
        </header>
    );
}
