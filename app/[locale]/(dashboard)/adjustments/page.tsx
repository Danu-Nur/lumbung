import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';
import { Pagination } from '@/components/shared/pagination';
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';

async function getAdjustments(organizationId: string, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const [adjustments, total] = await Promise.all([
        prisma.stockAdjustment.findMany({
            where: { organizationId },
            include: {
                product: true,
                warehouse: true,
                createdBy: true,
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize,
        }),
        prisma.stockAdjustment.count({
            where: { organizationId },
        }),
    ]);

    return { adjustments, total };
}

interface AdjustmentsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdjustmentsPage({ searchParams }: AdjustmentsPageProps) {
    const session = await auth();
    const t = await getTranslations('adjustments');
    const tCommon = await getTranslations('common');

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const pageSize = Number(params?.pageSize) || 10;

    const { adjustments, total } = await getAdjustments(session.user.organizationId, page, pageSize);
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
                            <li><strong>Increase:</strong> Add stock (e.g., found items).</li>
                            <li><strong>Decrease:</strong> Remove stock (e.g., damage, theft).</li>
                            <li><strong>Reasons:</strong> Categorize adjustments for reporting.</li>
                        </ul>
                    </div>
                }
            >
                <Link href="/adjustments/new">
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
                    {adjustments.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4">
                                {tCommon('table.noData')}
                            </p>
                            <Link href="/adjustments/new">
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
                                        <TableHead>{t('columns.date')}</TableHead>
                                        <TableHead>{t('columns.product')}</TableHead>
                                        <TableHead>{t('columns.warehouse')}</TableHead>
                                        <TableHead>{t('columns.type')}</TableHead>
                                        <TableHead className="text-right">{t('columns.quantity')}</TableHead>
                                        <TableHead>{t('columns.reason')}</TableHead>
                                        <TableHead>{t('columns.by')}</TableHead>
                                        <TableHead className="text-right">{tCommon('table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {adjustments.map((adjustment) => (
                                        <TableRow key={adjustment.id}>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {formatDateTime(adjustment.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium text-foreground">
                                                    {adjustment.product.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {adjustment.product.sku}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {adjustment.warehouse.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={adjustment.adjustmentType === 'increase' ? 'default' : 'destructive'}>
                                                    {adjustment.adjustmentType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span
                                                    className={`font-bold ${adjustment.adjustmentType === 'increase'
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                        }`}
                                                >
                                                    {adjustment.adjustmentType === 'increase' ? '+' : '-'}
                                                    {adjustment.quantity}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {adjustment.reason}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {adjustment.createdBy.name}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/adjustments/${adjustment.id}`}>
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
