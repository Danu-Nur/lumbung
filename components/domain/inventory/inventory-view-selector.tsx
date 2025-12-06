'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export function InventoryViewSelector() {
    const t = useTranslations('inventory');
    const searchParams = useSearchParams();
    const activeView = searchParams.get('view') || 'stock';

    // Function to preserve other search params while changing the view
    const getHref = (view: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', view);
        // Reset page when switching views as pagination is separate
        params.delete('page');
        // We might want to clear search 'q' too if it's specific to the view
        params.delete('q');
        return `?${params.toString()}`;
    };

    const getTriggerClass = (isActive: boolean) => cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted-foreground/10"
    );

    return (
        <div className="flex w-full overflow-x-auto sm:inline-flex sm:w-auto h-10 items-center justify-start sm:justify-center rounded-md bg-muted p-1 text-muted-foreground no-scrollbar">
            <Link href={getHref('stock')} className={getTriggerClass(activeView === 'stock')}>
                {t('tabs.stock')}
            </Link>
            <Link href={getHref('transfers')} className={getTriggerClass(activeView === 'transfers')}>
                {t('tabs.transfers')}
            </Link>
            <Link href={getHref('adjustments')} className={getTriggerClass(activeView === 'adjustments')}>
                {t('tabs.adjustments')}
            </Link>
        </div>
    );
}
