import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { dashboardService } from '@/lib/services/dashboardService';
import { FinancialStatsRow } from '@/components/domain/dashboard/financial-stats-row';
import { OperationalStatsRow } from '@/components/domain/dashboard/operational-stats-row';
import { DashboardChartsSection } from '@/components/domain/dashboard/dashboard-charts-section';
import { DashboardActivitySection } from '@/components/domain/dashboard/dashboard-activity-section';

export default async function DashboardPage() {
    const t = await getTranslations('dashboard');
    const session = await auth();

    const orgId = (session?.user as any)?.organizationId || '';
    const token = (session?.user as any)?.accessToken || '';

    if (!orgId) {
        // If really no auth, Middleware normally catches this
        // But we handle it gracefully here
    }

    // Fetch all data in parallel using the session token
    const [
        stats,
        lowStockItems,
        recentChanges,
        warehouseData,
        operationalStats,
        financialAnalytics,
        recentProducts
    ] = await Promise.all([
        dashboardService.getDashboardStats(orgId, token),
        dashboardService.getLowStockItems(orgId, token),
        dashboardService.getRecentInventoryChanges(orgId, token),
        dashboardService.getWarehouseOverview(orgId, token),
        dashboardService.getOperationalStats(orgId, token),
        dashboardService.getFinancialAnalytics(orgId, token),
        dashboardService.getRecentProducts(orgId, token),
    ]);

    // Financial Stats Row Data
    const financialStats = {
        totalPurchases: stats.totalPurchases,
        totalStockValue: stats.totalStockValue,
        totalSales: stats.totalSales,
        profit: stats.profit,
    };

    return (
        <div className="space-y-8 h-full w-full flex flex-col p-4 sm:p-6 lg:p-8">

            {/* Row 1: Financial Stats */}
            <section>
                <FinancialStatsRow data={financialStats} />
            </section>

            {/* Row 2: Operational Stats */}
            <section>
                <OperationalStatsRow data={operationalStats} />
            </section>

            {/* Row 3: Charts */}
            <section>
                <DashboardChartsSection
                    monthlyData={financialAnalytics.monthly}
                    yearlyData={financialAnalytics.yearly}
                />
            </section>

            {/* Row 4: Activity & Overview */}
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