import { auth } from '@/lib/auth';
import { InventoryListSection } from '@/components/domain/inventory/sections/inventory-list-section';
import { getQueryClient } from '@/lib/query';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import api from '@/lib/api';
import { dashboardService } from '@/lib/services/dashboardService';

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

    const queryClient = getQueryClient();

    // Prefetch critical data on server for instant hydration
    if (orgId && token) {
        const authHeader = { Authorization: `Bearer ${token}` };

        await Promise.allSettled([
            // 1. Products
            queryClient.prefetchQuery({
                queryKey: ['products', page, pageSize, search],
                queryFn: async () => {
                    const res = await api.get('/products', {
                        params: { page, pageSize, q: search },
                        headers: authHeader
                    });
                    return res.data;
                }
            }),
            // 2. Stats
            queryClient.prefetchQuery({
                queryKey: ['inventory-stats', orgId],
                queryFn: () => dashboardService.getDashboardStats(orgId, token)
            }),
            // 3. Lookups
            queryClient.prefetchQuery({
                queryKey: ['categories'],
                queryFn: async () => {
                    const res = await api.get('/categories', { headers: authHeader });
                    return res.data.categories || [];
                }
            }),
            queryClient.prefetchQuery({
                queryKey: ['warehouses'],
                queryFn: async () => {
                    const res = await api.get('/warehouses', { headers: authHeader });
                    return res.data.warehouses || [];
                }
            }),
            queryClient.prefetchQuery({
                queryKey: ['suppliers'],
                queryFn: async () => {
                    const res = await api.get('/suppliers', { headers: authHeader });
                    return res.data.suppliers || [];
                }
            })
        ]);
    }

    return (
        <div className="w-full space-y-6">
            <h1 className="text-2xl font-bold">Inventory</h1>
            <div className="min-h-[500px]">
                <HydrationBoundary state={dehydrate(queryClient)}>
                    <InventoryListSection
                        page={page}
                        pageSize={pageSize}
                        search={search}
                        modal={modal}
                        id={id}
                        organizationId={orgId}
                        accessToken={token}
                    />
                </HydrationBoundary>
            </div>
        </div>
    );
}
