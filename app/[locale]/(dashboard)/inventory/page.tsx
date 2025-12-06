import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { InventoryListSection } from '@/components/domain/inventory/sections/inventory-list-section';
import { InventoryTransferSection } from '@/components/domain/inventory/sections/inventory-transfer-section';
import { InventoryAdjustmentSection } from '@/components/domain/inventory/sections/inventory-adjustment-section';
import { InventoryViewSelector } from '@/components/domain/inventory/inventory-view-selector';
import { PageHeader } from '@/components/shared/page-header';

export default async function InventoryPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; pageSize?: string; q?: string; view?: string }>;
}) {
    const session = await auth();
    const t = await getTranslations('inventory');

    if (!session?.user) {
        redirect('/login');
    }

    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = Number(resolvedSearchParams.pageSize) || 10;
    const search = resolvedSearchParams.q || '';
    // Default view is 'stock'
    const view = resolvedSearchParams.view || 'stock';

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-4">
                <PageHeader
                    title={t('title')}
                    description={t('description')}
                />
                <InventoryViewSelector />
            </div>

            <div className="min-h-[500px]">
                {view === 'stock' && (
                    <InventoryListSection
                        page={page}
                        pageSize={pageSize}
                        search={search}
                    />
                )}
                {view === 'transfers' && (
                    <InventoryTransferSection
                        page={page}
                        pageSize={pageSize}
                        search={search}
                    />
                )}
                {view === 'adjustments' && (
                    <InventoryAdjustmentSection
                        page={page}
                        pageSize={pageSize}
                        search={search}
                    />
                )}
            </div>
        </div>
    );
}
