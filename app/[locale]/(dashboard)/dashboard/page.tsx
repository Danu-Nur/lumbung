import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { StatsCard } from '@/components/shared/stats-card';
import { Package, DollarSign, ShoppingCart, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';
import { dashboardService } from '@/lib/services/dashboardService';

// Widgets
import { LowStockItemsCard } from '@/components/dashboard/LowStockItemsCard';
import { RecentInventoryChangesCard } from '@/components/dashboard/RecentInventoryChangesCard';
import { SalesOverviewCard } from '@/components/dashboard/SalesOverviewCard';
import { PurchaseOverviewCard } from '@/components/dashboard/PurchaseOverviewCard';
import { WarehouseOverviewCard } from '@/components/dashboard/WarehouseOverviewCard';
import { TransferOverviewCard } from '@/components/dashboard/TransferOverviewCard';
import { AdjustmentOverviewCard } from '@/components/dashboard/AdjustmentOverviewCard';
import { CustomersOverviewCard } from '@/components/dashboard/CustomersOverviewCard';
import { SuppliersOverviewCard } from '@/components/dashboard/SuppliersOverviewCard';
import { SettingsQuickLinksCard } from '@/components/dashboard/SettingsQuickLinksCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { StockDistributionChart } from '@/components/dashboard/StockDistributionChart';

export default async function DashboardPage() {
    const session = await auth();
    const t = await getTranslations('dashboard');

    if (!session?.user) redirect('/login');

    if (!session.user.organizationId) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Super Admin Dashboard</h2>
                    <p className="text-muted-foreground">
                        Select an organization to view its dashboard
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
        salesData,
        purchaseData,
        warehouseData,
        transferData,
        adjustmentData,
        customerData,
        supplierData,
        salesChartData,
        stockDistributionData
    ] = await Promise.all([
        dashboardService.getDashboardStats(orgId),
        dashboardService.getLowStockItems(orgId),
        dashboardService.getRecentInventoryChanges(orgId),
        dashboardService.getSalesOverview(orgId),
        dashboardService.getPurchaseOverview(orgId),
        dashboardService.getWarehouseOverview(orgId),
        dashboardService.getTransferOverview(orgId),
        dashboardService.getAdjustmentOverview(orgId),
        dashboardService.getCustomerOverview(orgId),
        dashboardService.getSupplierOverview(orgId),
        dashboardService.getSalesChartData(orgId),
        dashboardService.getStockValueDistribution(orgId)
    ]);

    return (
        <div className="space-y-6 h-full flex flex-col">
            <PageHeader
                title={t('title')}
                description={t('welcome_back', { name: session.user.name ?? '' })}
                help={{
                    title: t('help.title'),
                    children: (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-base mb-1">{t('help.overview.heading')}</h3>
                                <div className="text-sm text-muted-foreground">{t('help.overview.content')}</div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-base mb-1">{t('help.metrics.heading')}</h3>
                                <div className="text-sm text-muted-foreground">
                                    <ul className="list-disc list-inside space-y-2 text-sm">
                                        <li>
                                            <strong>{t('metrics.total_products.title')}:</strong>{' '}
                                            {t('help.metrics.total_products')}
                                        </li>
                                        <li>
                                            <strong>{t('metrics.total_stock_value.title')}:</strong>{' '}
                                            {t('help.metrics.total_stock_value')}
                                        </li>
                                        <li>
                                            <strong>{t('metrics.active_orders.title')}:</strong>{' '}
                                            {t('help.metrics.active_orders')}
                                        </li>
                                        <li>
                                            <strong>{t('metrics.low_stock_items.title')}:</strong>{' '}
                                            {t('help.metrics.low_stock_items')}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )
                }}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title={t('metrics.total_products.title')}
                    value={stats.totalProducts}
                    icon={Package}
                    color="blue"
                />
                <StatsCard
                    title={t('metrics.total_stock_value.title')}
                    value={formatCurrency(stats.totalStockValue)}
                    icon={DollarSign}
                    color="green"
                />
                <StatsCard
                    title={t('metrics.active_orders.title')}
                    value={stats.activeSalesOrders}
                    icon={ShoppingCart}
                    color="purple"
                />
                <StatsCard
                    title={t('metrics.low_stock_items.title')}
                    value={stats.lowStockCount}
                    icon={AlertTriangle}
                    color="orange"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="h-[350px] col-span-2">
                    <SalesChart data={salesChartData} />
                </div>
                <div className="h-[350px]">
                    <StockDistributionChart data={stockDistributionData} />
                </div>

                {/* <div className="h-auto md:h-[350px]">
                    <SettingsQuickLinksCard />
                </div> */}
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    <div className="h-auto md:h-[537px]">
                        <LowStockItemsCard items={lowStockItems} />
                    </div>

                    <div className="h-auto md:h-[537px]">
                        <AdjustmentOverviewCard data={adjustmentData} />
                    </div>
                </div>

                {/* Middle Column */}
                <div className="space-y-6">
                    <div className="h-auto md:h-[725px]">
                        <RecentInventoryChangesCard changes={recentChanges} />
                    </div>
                    <div className="h-auto md:h-[350px]">
                        <WarehouseOverviewCard data={warehouseData} />
                    </div>

                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div className="h-auto md:h-[350px]">
                        <SalesOverviewCard data={salesData} />
                    </div>
                    <div className="h-auto md:h-[350px]">
                        <TransferOverviewCard data={transferData} />
                    </div>
                    <div className="h-auto md:h-[350px]">
                        <PurchaseOverviewCard data={purchaseData} />
                    </div>

                </div>
            </div>
        </div>
    );
}