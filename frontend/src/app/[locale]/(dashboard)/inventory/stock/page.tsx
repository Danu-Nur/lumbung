import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
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

    if (!orgId && token === 'offline-dev-token') {
        orgId = 'org-offline';
    }

    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = Number(resolvedSearchParams.pageSize) || 10;
    const search = resolvedSearchParams.q || '';
    const view = resolvedSearchParams.view || 'transfers';
    const modal = resolvedSearchParams.modal;
    const id = resolvedSearchParams.id;

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
