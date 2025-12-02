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
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';

async function getSalesOrders(organizationId: string, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const [orders, total] = await Promise.all([
        prisma.salesOrder.findMany({
            where: { organizationId },
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
            where: { organizationId },
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

    const { orders, total } = await getSalesOrders(session.user.organizationId, page, pageSize);
    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('title')}
                description={t('description')}
                help={
                    <div className="space-y-4">
                        <p>{t('help.purpose.content')}</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong>Create Order:</strong> Click "New Order" to start a sale.</li>
                            <li><strong>View Details:</strong> Click "View" to see order items and status.</li>
                            <li><strong>Status:</strong> Track orders from Draft to Fulfilled.</li>
                        </ul>
                    </div>
                }
            >
                <Link href="/sales-orders/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        {tCommon('buttons.add')}
                    </Button>
                </Link>
            </PageHeader>

            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                {tCommon('table.noData')}
                            </p>
                            <Link href="/sales-orders/new">
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
                                    {orders.map((order) => (
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
                                                <Link href={`/sales-orders/${order.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        {tCommon('buttons.view')}
                                                    </Button>
                                                </Link>
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
