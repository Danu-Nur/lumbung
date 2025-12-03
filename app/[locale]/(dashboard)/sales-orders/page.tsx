import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { SearchInput } from '@/components/shared/search-input';
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';
import { SalesOrderModalManager } from '@/components/domain/sales-orders/sales-order-modal-manager';
import { SalesOrderActions } from '@/components/domain/sales-orders/sales-order-actions';

async function getSalesOrders(organizationId: string, page: number = 1, pageSize: number = 10, query: string = '') {
    const skip = (page - 1) * pageSize;
    const where: any = {
        organizationId,
    };

    if (query) {
        where.OR = [
            { orderNumber: { contains: query } },
            { customer: { name: { contains: query } } },
        ];
    }

    const [orders, total] = await Promise.all([
        prisma.salesOrder.findMany({
            where,
            include: {
                customer: true,
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
        prisma.salesOrder.count({
            where,
        }),
    ]);

    return { orders, total };
}

interface SalesOrdersPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SalesOrdersPage({ searchParams }: SalesOrdersPageProps) {
    const session = await auth();
    const t = await getTranslations('sales');
    const tCommon = await getTranslations('common');

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const pageSize = Number(params?.pageSize) || 10;
    const query = params?.q?.toString() || '';

    const [salesData, customers, warehouses, products] = await Promise.all([
        getSalesOrders(session.user.organizationId, page, pageSize, query),
        prisma.customer.findMany({
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
            select: { id: true, name: true, sku: true, sellingPrice: true },
            orderBy: { name: 'asc' },
        }),
    ]);

    const { orders, total } = salesData;
    const totalPages = Math.ceil(total / pageSize);

    // Serialize Decimal fields for client component
    const serializedOrders = orders.map((order) => ({
        ...order,
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        discount: Number(order.discount),
        total: Number(order.total),
        items: order.items.map((item) => ({
            ...item,
            unitPrice: Number(item.unitPrice),
            discount: Number(item.discount),
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
            <SalesOrderModalManager
                orders={serializedOrders}
                customers={customers}
                warehouses={warehouses}
                products={products.map(p => ({ ...p, sellingPrice: Number(p.sellingPrice) }))}
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
                                        <li><strong>Create Order:</strong> Click "New Order" to start a sale.</li>
                                        <li><strong>View Details:</strong> Click "View" to see order items and status.</li>
                                        <li><strong>Status:</strong> Track orders from Draft to Fulfilled.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
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

            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                        <SearchInput placeholder={`${tCommon('buttons.search')}...`} />
                    </div>

                    {serializedOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
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
                                        <TableHead>{t('columns.customer')}</TableHead>
                                        <TableHead>{t('columns.date')}</TableHead>
                                        <TableHead>{t('columns.status')}</TableHead>
                                        <TableHead className="text-right">{t('columns.total')}</TableHead>
                                        <TableHead className="text-right">{t('columns.items')}</TableHead>
                                        <TableHead className="text-right">{tCommon('table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {serializedOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">
                                                {order.orderNumber}
                                            </TableCell>
                                            <TableCell>
                                                {order.customer?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(order.orderDate)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        order.status === 'DRAFT' ? 'secondary' :
                                                            order.status === 'CONFIRMED' ? 'default' :
                                                                order.status === 'FULFILLED' ? 'outline' : // Greenish usually
                                                                    order.status === 'INVOICED' ? 'outline' :
                                                                        'destructive'
                                                    }
                                                    className={
                                                        order.status === 'FULFILLED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-100' :
                                                            order.status === 'INVOICED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 hover:bg-purple-100' :
                                                                ''
                                                    }
                                                >
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(Number(order.total))}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {order.items.length}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <SalesOrderActions order={order} />
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
            </Card>
        </div>
    );
}
