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
import { SearchInput } from '@/components/shared/search-input';
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';
import { AdjustmentModalManager } from '@/components/domain/adjustments/adjustment-modal-manager';
import { AdjustmentActions } from '@/components/domain/adjustments/adjustment-actions';

async function getAdjustments(organizationId: string, page: number = 1, pageSize: number = 10, query: string = '') {
    const skip = (page - 1) * pageSize;
    const where: any = {
        organizationId,
    };

    if (query) {
        where.OR = [
            { product: { name: { contains: query } } },
            { reason: { contains: query } },
        ];
    }

    const [adjustments, total] = await Promise.all([
        prisma.stockAdjustment.findMany({
            where,
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
            where,
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
    const query = params?.q?.toString() || '';

    const [adjustmentData, products, warehouses] = await Promise.all([
        getAdjustments(session.user.organizationId, page, pageSize, query),
        prisma.product.findMany({
            where: { organizationId: session.user.organizationId, deletedAt: null },
            select: { id: true, name: true, sku: true, unit: true },
            orderBy: { name: 'asc' },
        }),
        prisma.warehouse.findMany({
            where: { organizationId: session.user.organizationId, deletedAt: null, isActive: true },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        }),
    ]);

    const { adjustments, total } = adjustmentData;
    const totalPages = Math.ceil(total / pageSize);

    // Serialize Decimal fields for client component
    const serializedAdjustments = adjustments.map((adjustment) => ({
        ...adjustment,
        product: {
            ...adjustment.product,
            sellingPrice: Number(adjustment.product.sellingPrice),
            costPrice: Number(adjustment.product.costPrice),
        },
    }));

    return (
        <div className="space-y-6">
            <AdjustmentModalManager
                adjustments={serializedAdjustments}
                products={products}
                warehouses={warehouses}
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
                                        <li><strong>Increase:</strong> Add stock (e.g., found items).</li>
                                        <li><strong>Decrease:</strong> Remove stock (e.g., damage, theft).</li>
                                        <li><strong>Reasons:</strong> Categorize adjustments for reporting.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )
                }}
                actions={
                    <div className="flex items-center gap-2">
                        <SearchInput placeholder={tCommon('buttons.search')} />
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
                    {serializedAdjustments.length === 0 ? (
                        <div className="text-center py-12">
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
                                    {serializedAdjustments.map((adjustment) => (
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
                                                <AdjustmentActions adjustment={adjustment} />
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
