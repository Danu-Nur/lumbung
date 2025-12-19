import { auth } from '@/lib/auth';
import { InventoryListSection } from '@/components/domain/inventory/sections/inventory-list-section';

export default async function InventoryPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; pageSize?: string; q?: string; modal?: string; id?: string }>;
}) {
    const session = await auth();
    const orgId = (session?.user as any)?.organizationId || '';
    const token = (session?.user as any)?.accessToken || '';

    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = Number(resolvedSearchParams.pageSize) || 10;
    const search = resolvedSearchParams.q || '';
    const modal = resolvedSearchParams.modal;
    const id = resolvedSearchParams.id;

    return (
        <div className="w-full space-y-6">
            <h1 className="text-2xl font-bold">Inventory</h1>
            <div className="min-h-[500px]">
                <InventoryListSection
                    page={page}
                    pageSize={pageSize}
                    search={search}
                    modal={modal}
                    id={id}
                />
            </div>
        </div>
    );
}
