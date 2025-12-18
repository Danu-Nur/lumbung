import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { dashboardService } from '@/lib/services/dashboardService';
import { FinancialStatsRow } from '@/components/domain/dashboard/financial-stats-row';
import { OperationalStatsRow } from '@/components/domain/dashboard/operational-stats-row';
import { DashboardChartsSection } from '@/components/domain/dashboard/dashboard-charts-section';
import { DashboardActivitySection } from '@/components/domain/dashboard/dashboard-activity-section';

import { cookies } from 'next/headers';

export default async function DashboardPage() {
    const t = await getTranslations('dashboard');

    // Get token from cookies (Microservices Auth)
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    let orgId = '';

    if (token) {
        try {
            // Check if it looks like a JWT
            const parts = token.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                orgId = payload.organizationId || '';
            }
        } catch (e) {
            console.error("Failed to parse token:", e);
        }
    }

    if (!orgId) {
        // Fallback for offline/demo if token is dummy
        if (token === 'offline-dev-token') {
            orgId = 'org-offline';
        } else {
            // If really no auth, Middleware normally catches this, but just in case:
            // return redirect('/login'); 
            // allowed to proceed to render empty dashboard or 0 values
        }
    }

    // Fetched using orgId from cookie above

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