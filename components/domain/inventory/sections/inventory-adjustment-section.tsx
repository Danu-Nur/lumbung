import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
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
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { getTranslations } from 'next-intl/server';
import { AdjustmentModalManager } from '@/components/domain/adjustments/adjustment-modal-manager';
import { AdjustmentActions } from '@/components/domain/adjustments/adjustment-actions';

interface InventoryAdjustmentSectionProps {
    page: number;
    pageSize: number;
    search: string;
}

export async function InventoryAdjustmentSection({ page, pageSize, search }: InventoryAdjustmentSectionProps) {
    const session = await auth();
    const t = await getTranslations('adjustments');
    const tInventory = await getTranslations('inventory');
    const tCommon = await getTranslations('common');

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const skip = (page - 1) * pageSize;
    const where: any = {
        organizationId: session.user.organizationId,
    };

    if (search) {
        where.OR = [
            { product: { name: { contains: search } } },
            { reason: { contains: search } },
        ];
    }

    const [adjustments, total, products, warehouses] = await Promise.all([
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
        <div className="space-y-4">
            <AdjustmentModalManager
                adjustments={serializedAdjustments}
                products={products}
                warehouses={warehouses}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{tInventory('tabs.adjustments')}</h2>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <SearchInput className="w-full sm:w-[300px]" placeholder={tCommon('buttons.search')} />
                    <Link href="?modal=create">
                        <Button className="shrink-0 w-10 h-10 p-0 sm:w-auto sm:h-10 sm:px-4 sm:py-2">
                            <Plus className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">{tCommon('buttons.add')}</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
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
                            <div className="relative w-full overflow-auto">
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
