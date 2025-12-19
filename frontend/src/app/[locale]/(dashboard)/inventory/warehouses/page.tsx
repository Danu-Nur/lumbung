import { auth } from '@/lib/auth';
import { WarehouseListSection } from '@/components/domain/warehouses/sections/warehouse-list-section';

export default async function WarehousesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; pageSize?: string; q?: string }>;
}) {
    const session = await auth();
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = Number(resolvedSearchParams.pageSize) || 10;
    const search = resolvedSearchParams.q || '';

    return (
        <div className="w-full space-y-6">
            <h1 className="text-2xl font-bold">Warehouses</h1>
            <div className="min-h-[500px]">
                <WarehouseListSection
                    page={page}
                    pageSize={pageSize}
                    search={search}
                    organizationId={(session?.user as any)?.organizationId || ''}
                />
            </div>
        </div>
    );
}
