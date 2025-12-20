'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingBag } from 'lucide-react';
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
import { LoadingState } from '@/components/shared/loading-state';
import { purchaseOrderService } from '@/lib/services/purchaseOrderService';
import { supplierService } from '@/lib/services/supplierService';
import { warehouseService } from '@/lib/services/warehouseService';
import { inventoryService } from '@/lib/services/inventoryService';
import { PurchaseOrderModalManager } from '@/components/domain/purchase-orders/purchase-order-modal-manager';
import { PurchaseOrderActions } from '@/components/domain/purchase-orders/purchase-order-actions';

interface PurchaseOrderListSectionProps {
    page: number;
    pageSize: number;
    search: string;
    organizationId: string;
    accessToken: string;
}

export function PurchaseOrderListSection({ page, pageSize, search, organizationId, accessToken }: PurchaseOrderListSectionProps) {
    const t = useTranslations('purchases');
    const tCommon = useTranslations('common');
    const queryClient = useQueryClient();

    const { data: purchaseData, isLoading: isOrdersLoading } = useQuery({
        queryKey: ['purchase-orders', page, pageSize, search],
        queryFn: () => purchaseOrderService.listPurchaseOrders({
            organizationId,
            page,
            pageSize,
            search,
            token: accessToken
        }),
    });

    const { data: suppliers = [] } = useQuery({
        queryKey: ['suppliers'],
        queryFn: () => supplierService.listSuppliers(organizationId, accessToken),
    });

    const { data: warehouses = [] } = useQuery({
        queryKey: ['warehouses'],
        queryFn: () => warehouseService.listWarehouses(organizationId, accessToken),
    });

    const { data: productsData } = useQuery({
        queryKey: ['products', 1, 100],
        queryFn: () => inventoryService.getInventory(organizationId, 1, 100),
    });

    if (isOrdersLoading) return <LoadingState />;

    const orders = purchaseData?.orders || [];
    const total = purchaseData?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    const products = (productsData?.products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        costPrice: Number(p.costPrice)
    }));

    return (
        <div className="space-y-6">
            <PurchaseOrderModalManager
                orders={orders}
                suppliers={suppliers}
                warehouses={warehouses}
                products={products}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
                }}
            />

            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                {tCommon('table.noData')}
                            </p>
                            <Link href="?modal=create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {tCommon('buttons.add')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('columns.orderNumber')}</TableHead>
                                        <TableHead>{t('columns.supplier')}</TableHead>
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
                                                {order.poNumber}
                                                {!order.synced && <span className="ml-2 text-xs text-orange-500">(Offline)</span>}
                                            </TableCell>
                                            <TableCell>
                                                {order.supplier?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(order.orderDate || order.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        order.status === 'DRAFT' ? 'secondary' :
                                                            order.status === 'SENT' ? 'default' :
                                                                order.status === 'COMPLETED' ? 'outline' :
                                                                    'destructive'
                                                    }
                                                    className={
                                                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : ''
                                                    }
                                                >
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(Number(order.total))}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <PurchaseOrderActions order={order} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="mt-4">
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
