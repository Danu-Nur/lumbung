'use client';

import { LoadingState } from '@/components/shared/loading-state';
import { useTranslations } from 'next-intl';

export default function DashboardLoading() {
    const t = useTranslations('common');
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <LoadingState message={t('table.loading') || 'Loading dashboard...'} />
        </div>
    );
}
