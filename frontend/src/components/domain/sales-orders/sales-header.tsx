'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ShoppingCart, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function SalesHeader() {
    const t = useTranslations('sales');
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeView = searchParams.get('view') || 'orders';

    const menuItems = [
        {
            id: 'orders',
            label: t('tabs.orders') === 'tabs.orders' ? 'Orders' : t('tabs.orders'),
            description: 'Manage sales orders',
            icon: ShoppingCart,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-950/20",
            border: "border-blue-200 dark:border-blue-800"
        },
        {
            id: 'customers',
            label: t('tabs.customers') === 'tabs.customers' ? 'Customers' : t('tabs.customers'),
            description: 'Manage customers',
            icon: Users,
            color: "text-indigo-500",
            bg: "bg-indigo-50 dark:bg-indigo-950/20",
            border: "border-indigo-200 dark:border-indigo-800"
        }
    ];

    const handleViewChange = (view: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', view);
        params.delete('page');
        params.delete('q');
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
            <div className="col-span-1 md:col-span-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {menuItems.map((item) => {
                    const isActive = activeView === item.id;
                    const Icon = item.icon;

                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => handleViewChange(item.id)}
                            className={cn(
                                "relative flex flex-col items-center justify-center p-4 h-full rounded-2xl border transition-all duration-300",
                                isActive
                                    ? cn("shadow-md ring-1 ring-inset", item.bg, item.border)
                                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    className={cn("absolute inset-0 rounded-2xl border-2", item.border.replace('border-', 'border-opacity-50 '))}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                />
                            )}

                            <div className={cn(
                                "p-3 rounded-full mb-3 transition-colors",
                                isActive ? "bg-white dark:bg-slate-900 shadow-sm" : "bg-slate-100 dark:bg-slate-900"
                            )}>
                                <Icon className={cn("w-6 h-6", item.color)} />
                            </div>
                            <span className={cn(
                                "text-xs lg:text-sm font-semibold transition-colors",
                                isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"
                            )}>
                                {item.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
