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
        <header className="h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
            {/* Organization Name */}
            <div>
                <h1 className="text-lg font-semibold text-foreground">
                    {session?.user?.organizationName || 'Inventory Pro'}
                </h1>
                <p className="text-sm text-muted-foreground">
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
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <User className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-medium text-foreground">
                                    {session.user.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {session.user.email}
                                </p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
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
                                            onClick={() => signOut({ callbackUrl: '/login' })}
                                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
