import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

// Client Section
import { InventoryListSection } from '@/components/domain/inventory/sections/inventory-list-section';

// Server Sections (Prisma)
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
    searchParams: Promise<{ page?: string; pageSize?: string; q?: string; view?: string; modal?: string; id?: string }>;
}) {
    // Auth Check
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    let orgId = '';

    if (token) {
        try {
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            orgId = payload.organizationId || '';
        } catch (e) {
            console.error("Token parse error", e);
        }
    }

    if (!orgId) {
        if (token === 'offline-dev-token') {
            orgId = 'org-offline';
        } else {
            // redirect('/login'); // Middleware protects this, but safe to redirect
        }
    }

    const t = await getTranslations('inventory');
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = Number(resolvedSearchParams.pageSize) || 10;
    const search = resolvedSearchParams.q || '';
    const view = resolvedSearchParams.view || 'stock';
    const modal = resolvedSearchParams.modal;
    const id = resolvedSearchParams.id;

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
                            modal={modal}
                            id={id}
                        />
                    )}
                    {view === 'categories' && (
                        <CategoriesListSection
                            page={page}
                            pageSize={pageSize}
                            search={search}
                            organizationId={orgId}
                        />
                    )}
                    {view === 'transfers' && (
                        <InventoryTransferSection
                            page={page}
                            pageSize={pageSize}
                            search={search}
                            modal={modal}
                            id={id}
                            organizationId={orgId}
                        />
                    )}
                    {view === 'adjustments' && (
                        <InventoryAdjustmentSection
                            page={page}
                            pageSize={pageSize}
                            search={search}
                            organizationId={orgId}
                        />
                    )}
                    {view === 'opname' && (
                        <InventoryOpnameSection
                            page={page}
                            pageSize={pageSize}
                            search={search}
                            modal={modal}
                            id={id}
                            organizationId={orgId}
                        />
                    )}
                    {view === 'warehouses' && (
                        <WarehouseListSection
                            page={page}
                            pageSize={pageSize}
                            search={search}
                            organizationId={orgId}
                        />
                    )}
                    {view === 'suppliers' && (
                        <SupplierListSection
                            page={page}
                            pageSize={pageSize}
                            search={search}
                            organizationId={orgId}
                        />
                    )}
                </div>
            </InventoryContentWrapper>
        </div>
    );
}
