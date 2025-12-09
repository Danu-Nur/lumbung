import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { getTranslations } from 'next-intl/server';
import { AdjustmentModalManager } from '@/components/domain/adjustments/adjustment-modal-manager';
import { AdjustmentActions } from '@/components/domain/adjustments/adjustment-actions';
import { AdjustmentTable } from '@/components/domain/inventory/tables/adjustment-table';
import { ImportModal } from '@/components/shared/import-modal';
import { importAdjustmentBatch } from '@/features/adjustments/import-actions';

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
                    {/* <SearchInput className="w-full sm:w-[300px]" placeholder={tCommon('buttons.search')} /> */}
                    <ImportModal
                        type="adjustments"
                        onImport={importAdjustmentBatch}
                        sampleData={[{
                            'Warehouse': 'Main Warehouse',
                            'Product Name': 'Product A',
                            'SKU': 'SKU-001',
                            'Quantity': 5,
                            'Type': 'Add',
                            'Reason': 'Found',
                            'Notes': 'Stock Audit'
                        }]}
                    />
                    <Link href="?view=adjustments&modal=create">
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
                            <Link href="?view=adjustments&modal=create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {tCommon('buttons.add')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full overflow-auto p-4">
                                <AdjustmentTable data={serializedAdjustments} />
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
