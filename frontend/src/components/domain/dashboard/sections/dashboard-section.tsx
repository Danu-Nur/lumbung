'use client';

import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
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
            {/* Toast Test Section - Development Only */}
            {/* <section className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-sm p-4 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="font-black text-sm uppercase text-gray-700 dark:text-gray-300">Test Toast Notifications</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Klik tombol untuk test notifikasi</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                        onClick={() => toast.success("Berhasil!", { description: "Data telah disimpan" })}
                        className="bg-[#00FFA3] text-black border-2 border-black dark:border-white py-2 px-3 font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:translate-x-[2px] active:translate-y-[2px] rounded-sm flex items-center justify-center gap-1.5"
                    >
                        <span>✓</span> Success
                    </button>
                    <button
                        onClick={() => toast.error("Error!", { description: "Koneksi terputus" })}
                        className="bg-[#FF5C00] text-white border-2 border-black dark:border-white py-2 px-3 font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:translate-x-[2px] active:translate-y-[2px] rounded-sm flex items-center justify-center gap-1.5"
                    >
                        <span>!</span> Error
                    </button>
                    <button
                        onClick={() => toast.info("Info", { description: "Update tersedia" })}
                        className="bg-[#334EFF] text-white border-2 border-black dark:border-white py-2 px-3 font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:translate-x-[2px] active:translate-y-[2px] rounded-sm flex items-center justify-center gap-1.5"
                    >
                        <span>i</span> Info
                    </button>
                    <button
                        onClick={() => toast.warning("Perhatian!", { description: "Stock hampir habis" })}
                        className="bg-[#FFDE00] text-black border-2 border-black dark:border-white py-2 px-3 font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:translate-x-[2px] active:translate-y-[2px] rounded-sm flex items-center justify-center gap-1.5"
                    >
                        <span>⚠</span> Warning
                    </button>
                </div>
            </section> */}

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
