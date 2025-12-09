import { auth } from '@/lib/auth';


import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
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
import { SearchInput } from '@/components/shared/search-input';
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';
import { PurchaseOrderModalManager } from '@/components/domain/purchase-orders/purchase-order-modal-manager';
import { PurchaseOrderActions } from '@/components/domain/purchase-orders/purchase-order-actions';

async function getPurchaseOrders(organizationId: string, page: number = 1, pageSize: number = 10, query: string = '') {
    const skip = (page - 1) * pageSize;
    const where: any = {
        organizationId,
    };

    if (query) {
        where.OR = [
            { poNumber: { contains: query } },
            { supplier: { name: { contains: query } } },
        ];
    }

    const [orders, total] = await Promise.all([
        prisma.purchaseOrder.findMany({
            where,
            include: {
                supplier: true,
                warehouse: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize,
        }),
        prisma.purchaseOrder.count({
            where,
        }),
    ]);

    return { orders, total };
}

interface PurchaseOrdersPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PurchaseOrdersPage({ searchParams }: PurchaseOrdersPageProps) {
    const session = await auth();
    const t = await getTranslations('purchases');
    const tCommon = await getTranslations('common');

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const pageSize = Number(params?.pageSize) || 10;
    const query = params?.q?.toString() || '';

    const [purchaseData, suppliers, warehouses, products] = await Promise.all([
        getPurchaseOrders(session.user.organizationId, page, pageSize, query),
        prisma.supplier.findMany({
            where: { organizationId: session.user.organizationId, deletedAt: null },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        }),
        prisma.warehouse.findMany({
            where: { organizationId: session.user.organizationId, deletedAt: null, isActive: true },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        }),
        prisma.product.findMany({
            where: { organizationId: session.user.organizationId, deletedAt: null },
            select: { id: true, name: true, sku: true, costPrice: true },
            orderBy: { name: 'asc' },
        }),
    ]);

    const { orders, total } = purchaseData;
    const totalPages = Math.ceil(total / pageSize);

    // Serialize Decimal fields for client component
    const serializedOrders = orders.map((order) => ({
        ...order,
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        total: Number(order.total),
        items: order.items.map((item) => ({
            ...item,
            unitCost: Number(item.unitCost),
            lineTotal: Number(item.lineTotal),
            product: {
                ...item.product,
                sellingPrice: Number(item.product.sellingPrice),
                costPrice: Number(item.product.costPrice),
            },
        })),
    }));

    return (
        <div className="space-y-6">
            <PurchaseOrderModalManager
                orders={serializedOrders}
                suppliers={suppliers}
                warehouses={warehouses}
                products={products.map(p => ({ ...p, costPrice: Number(p.costPrice) }))}
            />
            <PageHeader
                title={t('title')}
                description={t('description')}
                help={{
                    title: t('help.title'),
                    children: (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-base mb-1">{t('help.purpose.heading')}</h3>
                                <div className="text-sm text-muted-foreground">{t('help.purpose.content')}</div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-base mb-1">Features</h3>
                                <div className="text-sm text-muted-foreground">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li><strong>Create PO:</strong> Click "New PO" to order from suppliers.</li>
                                        <li><strong>View Details:</strong> Click "View" to see items and receive stock.</li>
                                        <li><strong>Status:</strong> Track orders from Draft to Completed.</li>
                                    </ul>
                                </div>
                            </div>
                        </div >
                    )
                }}
                actions={
                    <div className="flex items-center gap-2">
                        <Link href="?modal=create">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                {tCommon('buttons.add')}
                            </Button>
                        </Link>
                    </div>
                }
            />

            < Card >
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                        <SearchInput placeholder={`${tCommon('buttons.search')}...`} />
                    </div>
                    {serializedOrders.length === 0 ? (
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
                                    {serializedOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">
                                                {order.poNumber}
                                            </TableCell>
                                            <TableCell>
                                                {order.supplier.name}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(order.orderDate)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        order.status === 'DRAFT' ? 'secondary' :
                                                            order.status === 'SENT' ? 'default' :
                                                                order.status === 'COMPLETED' ? 'outline' : // Greenish
                                                                    'destructive'
                                                    }
                                                    className={
                                                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100' :
                                                            ''
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
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                pageSize={pageSize}
                                totalItems={total}
                            />
                        </>
                    )}
                </CardContent>
            </Card >
        </div >
    );
}
