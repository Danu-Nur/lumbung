'use client';

import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from './theme-toggle';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Topbar() {
    const { data: session } = useSession();
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <header className="h-16 glass-panel border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
            {/* Organization Name */}
            <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {session?.user?.organizationName || 'Inventory Pro'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {session?.user?.roleName || 'Guest'}
                </p>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Menu */}
                {session?.user && (
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg glass-panel hover:bg-white/20 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {session.user.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {session.user.email}
                                </p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                        </button>

                        {/* Dropdown */}
                        {showDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowDropdown(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 glass-panel rounded-lg shadow-lg z-50">
                                    <div className="p-2">
                                        <button
                                            onClick={() => signOut({ callbackUrl: '/login' })}
                                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Logout</span>
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
