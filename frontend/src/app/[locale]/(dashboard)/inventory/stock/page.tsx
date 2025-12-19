import { auth } from '@/lib/auth';
import { InventoryTransferSection } from '@/components/domain/inventory/sections/inventory-transfer-section';
import { InventoryAdjustmentSection } from '@/components/domain/inventory/sections/inventory-adjustment-section';
import { InventoryOpnameSection } from '@/components/domain/inventory/sections/inventory-opname-section';
import { StockHeader } from '@/components/domain/inventory/components/stock-header';
import { InventoryContentWrapper } from '@/components/domain/inventory/components/inventory-content-wrapper';

export default async function StockPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; pageSize?: string; q?: string; view?: string; modal?: string; id?: string }>;
}) {
    const session = await auth();
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = Number(resolvedSearchParams.pageSize) || 10;
    const search = resolvedSearchParams.q || '';
    const view = resolvedSearchParams.view || 'transfers';
    const modal = resolvedSearchParams.modal;
    const id = resolvedSearchParams.id;
    const orgId = (session?.user as any)?.organizationId || '';

    return (
        <div className="w-full space-y-6">
            <StockHeader />
            <InventoryContentWrapper viewKey={view}>
                <div className="min-h-[500px]">
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
                </div>
            </InventoryContentWrapper>
        </div>
    );
}
