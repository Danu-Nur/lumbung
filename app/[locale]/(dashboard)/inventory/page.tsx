import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { InventoryListSection } from '@/components/domain/inventory/sections/inventory-list-section';
import { InventoryTransferSection } from '@/components/domain/inventory/sections/inventory-transfer-section';
import { InventoryAdjustmentSection } from '@/components/domain/inventory/sections/inventory-adjustment-section';
import { InventoryOpnameSection } from '@/components/domain/inventory/sections/inventory-opname-section';
import { CategoriesListSection } from '@/components/domain/categories/sections/categories-list-section';
import { WarehouseListSection } from '@/components/domain/warehouses/sections/warehouse-list-section';
import { SupplierListSection } from '@/components/domain/suppliers/sections/supplier-list-section';
import { InventoryHeader } from '@/components/domain/inventory/inventory-header';
import { InventoryContentWrapper } from '@/components/domain/inventory/inventory-content-wrapper';

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
        <div className="w-full space-y-6">
            <InventoryHeader />

            <InventoryContentWrapper viewKey={view}>
                <div className="min-h-[500px]">
                    {view === 'stock' && (
                        <InventoryListSection
                            page={page}
                            pageSize={pageSize}
                            search={search}
                        />
                    )}
                    {view === 'categories' && (
                        <CategoriesListSection
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
                    {view === 'opname' && (
                        <InventoryOpnameSection
                            page={page}
                            pageSize={pageSize}
                            search={search}
                        />
                    )}
                    {view === 'warehouses' && (
                        <WarehouseListSection
                            page={page}
                            pageSize={pageSize}
                            search={search}
                        />
                    )}
                    {view === 'suppliers' && (
                        <SupplierListSection
                            page={page}
                            pageSize={pageSize}
                            search={search}
                        />
                    )}
                </div>
            </InventoryContentWrapper>
        </div>
    );
}
