'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Package, ArrowRightLeft, ClipboardList, Info, ClipboardCheck, Layers, Warehouse as WarehouseIcon, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function InventoryHeader() {
    const t = useTranslations('inventory');
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeView = searchParams.get('view') || 'stock';

    const menuItems = [
        {
            id: 'stock',
            label: t('tabs.stock'),
            description: t('menu.stock.description'),
            icon: Package,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-950/20",
            border: "border-blue-200 dark:border-blue-800"
        },
        {
            id: 'warehouses',
            label: t('tabs.warehouses') === 'tabs.warehouses' ? 'Warehouses' : t('tabs.warehouses'), // Fallback if missing
            description: t('menu.warehouses.description') === 'menu.warehouses.description' ? 'Manage storage locations' : t('menu.warehouses.description'),
            icon: WarehouseIcon,
            color: "text-indigo-500",
            bg: "bg-indigo-50 dark:bg-indigo-950/20",
            border: "border-indigo-200 dark:border-indigo-800"
        },
        {
            id: 'suppliers',
            label: t('tabs.suppliers') === 'tabs.suppliers' ? 'Suppliers' : t('tabs.suppliers'),
            description: t('menu.suppliers.description') === 'menu.suppliers.description' ? 'Manage suppliers' : t('menu.suppliers.description'),
            icon: Building2,
            color: "text-cyan-500",
            bg: "bg-cyan-50 dark:bg-cyan-950/20",
            border: "border-cyan-200 dark:border-cyan-800"
        },
        {
            id: 'categories',
            label: t('tabs.categories'),
            description: t('menu.categories.description'),
            icon: Layers,
            color: "text-lime-500",
            bg: "bg-lime-50 dark:bg-lime-950/20",
            border: "border-lime-200 dark:border-lime-800"
        },
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">

            {/* Navigation Cards (Bento Grid) */}
            <div className="col-span-1 md:col-span-12 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
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

                            {/* Visual connector to content if active - simplified as a bottom bar or similar if needed, 
                                but the 'merged' look is achieved by style matching with the content wrapper below */}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
