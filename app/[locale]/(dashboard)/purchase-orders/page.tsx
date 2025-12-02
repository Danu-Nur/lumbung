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
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';

async function getPurchaseOrders(organizationId: string, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const [orders, total] = await Promise.all([
        prisma.purchaseOrder.findMany({
            where: { organizationId },
            include: {
                supplier: true,
                warehouse: true,
                items: true,
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize,
        }),
        prisma.purchaseOrder.count({
            where: { organizationId },
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

    const { orders, total } = await getPurchaseOrders(session.user.organizationId, page, pageSize);
    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('title')}
                description={t('description')}
                help={{
                    title: t('help.title'),
                    sections: [
                        {
                            heading: t('help.purpose.heading'),
                            content: t('help.purpose.content'),
                        },
                        {
                            heading: 'Features',
                            content: (
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Create PO:</strong> Click "New PO" to order from suppliers.</li>
                                    <li><strong>View Details:</strong> Click "View" to see items and receive stock.</li>
                                    <li><strong>Status:</strong> Track orders from Draft to Completed.</li>
                                </ul>
                            ),
                        },
                    ],
                }}
                actions={
                    <Link href="/purchase-orders/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            {tCommon('buttons.add')}
                        </Button>
                    </Link>
                }
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
                            <Link href="/purchase-orders/new">
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
                                    {orders.map((order) => (
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
                                                <Link href={`/purchase-orders/${order.id}`}>
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
