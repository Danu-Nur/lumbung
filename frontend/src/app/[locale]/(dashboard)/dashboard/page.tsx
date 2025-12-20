import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { getQueryClient } from '@/lib/query';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { dashboardService } from '@/lib/services/dashboardService';
import { DashboardSection } from '@/components/domain/dashboard/sections/dashboard-section';

export default async function DashboardPage() {
    const t = await getTranslations('dashboard');
    const session = await auth();

    const orgId = (session?.user as any)?.organizationId || '';
    const token = (session?.user as any)?.accessToken || '';

    const queryClient = getQueryClient();

    // Prefetch critical dashboard data
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: ['dashboard-stats', orgId],
            queryFn: () => dashboardService.getDashboardStats(orgId, token),
        }),
        queryClient.prefetchQuery({
            queryKey: ['dashboard-operational-stats', orgId],
            queryFn: () => dashboardService.getOperationalStats(orgId, token),
        }),
        queryClient.prefetchQuery({
            queryKey: ['dashboard-financial-analytics', orgId],
            queryFn: () => dashboardService.getFinancialAnalytics(orgId, token),
        }),
        queryClient.prefetchQuery({
            queryKey: ['dashboard-warehouse-overview', orgId],
            queryFn: () => dashboardService.getWarehouseOverview(orgId, token),
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="p-4 sm:p-6 lg:p-8">
                <DashboardSection organizationId={orgId} accessToken={token} />
            </div>
        </HydrationBoundary>
    );
}