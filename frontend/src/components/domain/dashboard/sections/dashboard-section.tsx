'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/lib/services/dashboardService';
import { FinancialStatsRow } from '@/components/domain/dashboard/financial-stats-row';
import { OperationalStatsRow } from '@/components/domain/dashboard/operational-stats-row';
import { DashboardChartsSection } from '@/components/domain/dashboard/dashboard-charts-section';
import { DashboardActivitySection } from '@/components/domain/dashboard/dashboard-activity-section';
import { LoadingState } from '@/components/shared/loading-state';

interface DashboardSectionProps {
    organizationId: string;
    accessToken: string;
}

export function DashboardSection({ organizationId, accessToken }: DashboardSectionProps) {
    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['dashboard-stats', organizationId],
        queryFn: () => dashboardService.getDashboardStats(organizationId, accessToken),
    });

    const { data: lowStockItems = [] } = useQuery({
        queryKey: ['dashboard-low-stock', organizationId],
        queryFn: () => dashboardService.getLowStockItems(organizationId, accessToken),
    });

    const { data: recentChanges = [] } = useQuery({
        queryKey: ['dashboard-recent-changes', organizationId],
        queryFn: () => dashboardService.getRecentInventoryChanges(organizationId, accessToken),
    });

    const { data: warehouseData } = useQuery({
        queryKey: ['dashboard-warehouse-overview', organizationId],
        queryFn: () => dashboardService.getWarehouseOverview(organizationId, accessToken),
    });

    const { data: operationalStats } = useQuery({
        queryKey: ['dashboard-operational-stats', organizationId],
        queryFn: () => dashboardService.getOperationalStats(organizationId, accessToken),
    });

    const { data: financialAnalytics } = useQuery({
        queryKey: ['dashboard-financial-analytics', organizationId],
        queryFn: () => dashboardService.getFinancialAnalytics(organizationId, accessToken),
    });

    const { data: recentProducts = [] } = useQuery({
        queryKey: ['dashboard-recent-products', organizationId],
        queryFn: () => dashboardService.getRecentProducts(organizationId, accessToken),
    });

    if (isStatsLoading || !stats || !operationalStats || !financialAnalytics || !warehouseData) {
        return <LoadingState />;
    }

    const financialStats = {
        totalPurchases: stats.totalPurchases,
        totalStockValue: stats.totalStockValue,
        totalSales: stats.totalSales,
        profit: stats.profit,
    };

    return (
        <div className="space-y-8 h-full w-full flex flex-col">
            <section>
                <FinancialStatsRow data={financialStats} />
            </section>

            <section>
                <OperationalStatsRow data={operationalStats} />
            </section>

            <section>
                <DashboardChartsSection
                    monthlyData={financialAnalytics.monthly}
                    yearlyData={financialAnalytics.yearly}
                />
            </section>

            <section>
                <DashboardActivitySection
                    recentProducts={recentProducts}
                    lowStockItems={lowStockItems}
                    recentChanges={recentChanges}
                    warehouseData={warehouseData}
                />
            </section>
        </div>
    );
}
