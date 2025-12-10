import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { dashboardService } from '@/lib/services/dashboardService';
import { FinancialStatsRow } from '@/components/domain/dashboard/financial-stats-row';
import { OperationalStatsRow } from '@/components/domain/dashboard/operational-stats-row';
import { DashboardChartsSection } from '@/components/domain/dashboard/dashboard-charts-section';
import { DashboardActivitySection } from '@/components/domain/dashboard/dashboard-activity-section';

export default async function DashboardPage() {
    const session = await auth();
    const t = await getTranslations('dashboard');

    if (!session?.user) redirect('/login');

    if (!session.user.organizationId) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">{t('superAdmin.title')}</h2>
                    <p className="text-muted-foreground">
                        {t('superAdmin.description')}
                    </p>
                </div>
            </div>
        );
    }

    const orgId = session.user.organizationId;

    // Fetch all data in parallel
    const [
        stats,
        lowStockItems,
        recentChanges,
        warehouseData,
        operationalStats,
        financialAnalytics,
        recentProducts
    ] = await Promise.all([
        dashboardService.getDashboardStats(orgId),
        dashboardService.getLowStockItems(orgId),
        dashboardService.getRecentInventoryChanges(orgId),
        dashboardService.getWarehouseOverview(orgId),
        dashboardService.getOperationalStats(orgId),
        dashboardService.getFinancialAnalytics(orgId),
        dashboardService.getRecentProducts(orgId),
    ]);

    // Financial Stats Row Data
    const financialStats = {
        totalPurchases: stats.totalPurchases,
        totalStockValue: stats.totalStockValue,
        totalSales: stats.totalSales,
        profit: stats.profit,
    };

    return (
        <div className="space-y-8 h-full flex flex-col p-4 sm:p-6 lg:p-8">

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