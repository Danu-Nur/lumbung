'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { ArrowRightLeft, ClipboardList, ClipboardCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function StockHeader() {
    const t = useTranslations('inventory');
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeView = searchParams.get('view') || 'transfers';

    const menuItems = [
        {
            id: 'transfers',
            label: t('tabs.transfers'),
            description: t('menu.transfers.description'),
            icon: ArrowRightLeft,
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-950/20",
            border: "border-purple-200 dark:border-purple-800"
        },
        {
            id: 'adjustments',
            label: t('tabs.adjustments'),
            description: t('menu.adjustments.description'),
            icon: ClipboardList,
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-950/20",
            border: "border-orange-200 dark:border-orange-800"
        },
        {
            id: 'opname',
            label: t('tabs.opname'),
            description: t('menu.opname.description'),
            icon: ClipboardCheck,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-950/20",
            border: "border-emerald-200 dark:border-emerald-800"
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
        <div className="flex flex-col gap-4 mb-6">
            <h1 className="text-2xl font-bold">Stock Management</h1>
            {/* Navigation Cards (Bento Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {menuItems.map((item) => {
                    const isActive = activeView === item.id;
                    const Icon = item.icon;

                    return (
                        <motion.button
                            key={item.id}
                            onClick={() => handleViewChange(item.id)}
                            className={cn(
                                "relative flex flex-col items-center justify-center p-4 h-full rounded-none border-2 border-black transition-all duration-300",
                                isActive
                                    ? cn("bg-primary text-primary-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[2px] translate-y-[2px]")
                                    : "bg-white dark:bg-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                            )}
                        >
                            <div className={cn(
                                "p-3 rounded-none border-2 border-black mb-3 transition-colors",
                                isActive ? "bg-white text-primary shadow-sm" : "bg-slate-100 dark:bg-slate-900"
                            )}>
                                <Icon className={cn("w-6 h-6", item.color)} />
                            </div>
                            <span className={cn(
                                "text-xs lg:text-sm font-bold transition-colors",
                                isActive ? "text-primary-foreground" : "text-slate-900 dark:text-slate-100"
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
