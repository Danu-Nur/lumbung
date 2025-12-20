'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/shared/pagination';
import { SalesOrderModalManager } from '@/components/domain/sales-orders/sales-order-modal-manager';
import { SalesOrderActions } from '@/components/domain/sales-orders/sales-order-actions';
import { salesOrderService } from '@/lib/services/salesOrderService';
import { customerService } from '@/lib/services/customerService';
import { warehouseService } from '@/lib/services/warehouseService';
import { inventoryService } from '@/lib/services/inventoryService';
import { LoadingState } from '@/components/shared/loading-state';

interface SalesOrderListSectionProps {
    page: number;
    pageSize: number;
    search: string;
    organizationId: string;
    accessToken: string;
}

export function SalesOrderListSection({ page, pageSize, search, organizationId, accessToken }: SalesOrderListSectionProps) {
    const t = useTranslations('sales');
    const tCommon = useTranslations('common');
    const queryClient = useQueryClient();

    const { data: salesData, isLoading: isOrdersLoading } = useQuery({
        queryKey: ['sales-orders', page, pageSize, search],
        queryFn: () => salesOrderService.listSalesOrders({
            organizationId,
            page,
            pageSize,
            search,
            token: accessToken
        }),
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => customerService.listCustomers({ organizationId, token: accessToken }).then(res => res.customers),
    });

    const { data: warehouses = [] } = useQuery({
        queryKey: ['warehouses'],
        queryFn: () => warehouseService.listWarehouses(organizationId, accessToken),
    });

    const { data: productsData } = useQuery({
        queryKey: ['products', 1, 100], // Fetch more for selection
        queryFn: () => inventoryService.getInventory(organizationId, 1, 100),
    });

    if (isOrdersLoading) return <LoadingState />;

    const orders = salesData?.orders || [];
    const total = salesData?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    // Filter/Map products for modal
    const products = (productsData?.products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        sellingPrice: Number(p.sellingPrice)
    }));

    return (
        <div className="space-y-6">
            <SalesOrderModalManager
                orders={orders}
                customers={customers}
                warehouses={warehouses}
                products={products}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
                }}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{t('title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link href="?view=orders&modal=create">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            {tCommon('buttons.add')}
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                {tCommon('table.noData')}
                            </p>
                            <Link href="?view=orders&modal=create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {tCommon('buttons.add')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full overflow-auto p-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('columns.orderNumber')}</TableHead>
                                            <TableHead>{t('columns.customer')}</TableHead>
                                            <TableHead>{t('columns.date')}</TableHead>
                                            <TableHead>{t('columns.status')}</TableHead>
                                            <TableHead className="text-right">{t('columns.total')}</TableHead>
                                            <TableHead className="text-right">{tCommon('table.actions')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order: any) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">
                                                    {order.orderNumber}
                                                    {!order.synced && <span className="ml-2 text-xs text-orange-500">(Offline)</span>}
                                                </TableCell>
                                                <TableCell>
                                                    {order.customer?.name || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(order.orderDate || order.createdAt)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            order.status === 'DRAFT' ? 'secondary' :
                                                                order.status === 'CONFIRMED' ? 'default' :
                                                                    order.status === 'FULFILLED' ? 'outline' :
                                                                        'destructive'
                                                        }
                                                        className={
                                                            order.status === 'FULFILLED' ? 'bg-green-100 text-green-800' : ''
                                                        }
                                                    >
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(Number(order.total))}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <SalesOrderActions order={order} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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
        </div>
    );
}
