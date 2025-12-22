'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/shared/pagination';
import { formatCurrency } from '@/lib/utils';
import { Package, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { InventoryModalManager } from '@/components/domain/inventory/modals/inventory-modal-manager';
import { inventoryService } from '@/lib/services/inventoryService';
import { categoryService } from '@/lib/services/categoryService';
import { warehouseService } from '@/lib/services/warehouseService';
import { supplierService } from '@/lib/services/supplierService';
import { InventoryTable } from '@/components/domain/inventory/tables/inventory-table';
import { LoadingState } from '@/components/shared/loading-state';
import { dashboardService } from '@/lib/services/dashboardService';
import { AlertCircle, BarChart3, TrendingDown } from 'lucide-react';
import { serializeAny } from '@/lib/utils/serialization';

interface InventoryListSectionProps {
    page: number;
    pageSize: number;
    search: string;
    modal?: string;
    id?: string;
    organizationId: string;
    accessToken: string;
}

export function InventoryListSection({ page, pageSize, search, modal, id, organizationId, accessToken }: InventoryListSectionProps) {
    const t = useTranslations('inventory');
    const tCommon = useTranslations('common');
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data, isLoading } = useQuery({
        queryKey: ['products', organizationId, page, pageSize, search],
        queryFn: () => inventoryService.getInventory(organizationId, page, pageSize, search, accessToken),
    });

    const products = data?.products || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    // Data needed for Modals
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryService.listCategories(organizationId, accessToken)
    });

    const { data: warehouses = [] } = useQuery({
        queryKey: ['warehouses'],
        queryFn: () => warehouseService.listWarehouses(organizationId, accessToken)
    });

    const { data: suppliers = [] } = useQuery({
        queryKey: ['suppliers'],
        queryFn: () => supplierService.listSuppliers(organizationId, accessToken)
    });

    // const { data: session } = useSession();
    // const token = (session?.user as any)?.accessToken;
    // const organizationId = (session?.user as any)?.organizationId;

    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['inventory-stats', organizationId],
        queryFn: async () => {
            if (!organizationId) return null;
            return await dashboardService.getDashboardStats(organizationId, accessToken);
        },
        enabled: !!organizationId,
    });

    if (isLoading || isStatsLoading) return <LoadingState message={tCommon('table.loading') || 'Loading...'} />;

    // Serialize Decimal fields using shared utility
    const serializedProducts = products.map((product: any) => ({
        ...serializeAny(product),
        totalStock: product.inventoryItems?.reduce((acc: number, item: any) => acc + item.quantityOnHand, 0) || 0,
    }));


    const handleSuccess = async () => {
        // 1. Invalidate all relevant queries to trigger fresh data fetch
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['products'], refetchType: 'all' }),
            queryClient.invalidateQueries({ queryKey: ['inventory-stats'], refetchType: 'all' }),
            queryClient.invalidateQueries({ queryKey: ['categories'], refetchType: 'all' }),
            queryClient.invalidateQueries({ queryKey: ['warehouses'], refetchType: 'all' }),
            queryClient.invalidateQueries({ queryKey: ['suppliers'], refetchType: 'all' }),
        ]);

        // 2. Refresh the server component state as well
        router.refresh();
    };

    return (
        <div className="space-y-6">
            <InventoryModalManager
                products={serializedProducts}
                categories={categories}
                warehouses={warehouses}
                suppliers={suppliers}
                onSuccess={handleSuccess}
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="neo-stat-card">
                    <CardContent className="stat-content">
                        <div className="stat-layout">
                            <div className="stat-info">
                                <p className="stat-label">{t('summary.totalProducts') || 'Total Products'}</p>
                                <h3 className="stat-value">{stats?.totalProducts || 0}</h3>
                            </div>
                            <div className="stat-icon neo-icon-indigo">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="neo-stat-card">
                    <CardContent className="stat-content">
                        <div className="stat-layout">
                            <div className="stat-info">
                                <p className="stat-label">{t('summary.outOfStock') || 'Out of Stock'}</p>
                                <h3 className="stat-value">{stats?.outOfStockCount || 0}</h3>
                            </div>
                            <div className="stat-icon neo-icon-red">
                                <TrendingDown className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="neo-stat-card">
                    <CardContent className="stat-content">
                        <div className="stat-layout">
                            <div className="stat-info">
                                <p className="stat-label">{t('summary.lowStock') || 'Low Stock'}</p>
                                <h3 className="stat-value">{stats?.lowStockCount || 0}</h3>
                            </div>
                            <div className="stat-icon neo-icon-amber">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="neo-stat-card">
                    <CardContent className="stat-content">
                        <div className="stat-layout">
                            <div className="stat-info">
                                <p className="stat-label">{t('summary.stockValue') || 'Stock Value'}</p>
                                <h3 className="stat-value">{formatCurrency(stats?.totalStockValue || 0)}</h3>
                            </div>
                            <div className="stat-icon neo-icon-emerald">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col justify-start items-start gap-2">
                    <h2 className="text-lg font-semibold tracking-tight">{t('tabs.stock')}</h2>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <div className="flex items-center gap-2 justify-end">
                    {/* Placeholder for Import */}
                    <Link href="?view=stock&modal=create">
                        <Button className="shrink-0 w-10 h-10 p-0 sm:w-auto sm:h-10 sm:px-4 sm:py-2" variant="indigo">
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">{tCommon('buttons.add')}</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <Card variant="no">
                <CardContent className="p-0">
                    {serializedProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                {tCommon('table.noData')}
                            </p>
                            <Link href="?view=stock&modal=create">
                                <Button variant="indigo">
                                    <Plus className="w-4 h-4 mr-2" />
                                    {tCommon('buttons.add')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full overflow-auto p-4">
                                <InventoryTable
                                    data={serializedProducts}
                                    warehouses={warehouses}
                                    suppliers={suppliers}
                                    onSuccess={handleSuccess}
                                />
                            </div>
                            <div className="p-4 border-t">
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    pageSize={pageSize}
                                    totalItems={total}
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div >
    );
}
