import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';

import { getTranslations } from 'next-intl/server';
import { TransferModalManager } from '@/components/domain/transfers/transfer-modal-manager';
import { TransferActions } from '@/components/domain/transfers/transfer-actions';
import { TransferTable } from '@/components/domain/inventory/tables/transfer-table';
import { ImportModal } from '@/components/shared/import-modal';
import { importTransferBatch } from '@/features/transfers/import-actions';

interface InventoryTransferSectionProps {
    page: number;
    pageSize: number;
    search: string;
}

export async function InventoryTransferSection({ page, pageSize, search }: InventoryTransferSectionProps) {
    const session = await auth();
    const t = await getTranslations('transfers');
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
            { transferNumber: { contains: search } },
            { fromWarehouse: { name: { contains: search } } },
            { toWarehouse: { name: { contains: search } } },
        ];
    }

    const [transfers, total, warehouses, products] = await Promise.all([
        prisma.stockTransfer.findMany({
            where,
            include: {
                fromWarehouse: true,
                toWarehouse: true,
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
        prisma.stockTransfer.count({
            where,
        }),
        prisma.warehouse.findMany({
            where: { organizationId: session.user.organizationId, deletedAt: null, isActive: true },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        }),
        prisma.product.findMany({
            where: { organizationId: session.user.organizationId, deletedAt: null },
            select: { id: true, name: true, sku: true },
            orderBy: { name: 'asc' },
        }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    // Serialize Decimal fields for client component
    const serializedTransfers = transfers.map((transfer) => ({
        ...transfer,
        items: transfer.items.map((item) => ({
            ...item,
            product: {
                ...item.product,
                sellingPrice: Number(item.product.sellingPrice),
                costPrice: Number(item.product.costPrice),
            },
        })),
    }));

    return (
        <div className="space-y-4">
            <TransferModalManager
                transfers={serializedTransfers}
                warehouses={warehouses}
                products={products}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{tInventory('tabs.transfers')}</h2>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* <SearchInput className="w-full sm:w-[300px]" placeholder={tCommon('buttons.search')} /> */}
                    <ImportModal
                        type="transfers"
                        onImport={importTransferBatch}
                        sampleData={[{
                            'Transfer Number': 'TRF-001',
                            'From Warehouse': 'Main Warehouse',
                            'To Warehouse': 'Store A',
                            'Product Name': 'Product A',
                            'SKU': 'SKU-001',
                            'Quantity': 10,
                            'Notes': 'Monthly replenishment'
                        }]}
                    />
                    <Link href="?view=transfers&modal=create">
                        <Button className="shrink-0 w-10 h-10 p-0 sm:w-auto sm:h-10 sm:px-4 sm:py-2">
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">{tCommon('buttons.add')}</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {serializedTransfers.length === 0 ? (
                        <div className="text-center py-12">
                            <ArrowLeftRight className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                {tCommon('table.noData')}
                            </p>
                            <Link href="?view=transfers&modal=create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {tCommon('buttons.add')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full overflow-auto p-4">
                                <TransferTable data={serializedTransfers} />
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
