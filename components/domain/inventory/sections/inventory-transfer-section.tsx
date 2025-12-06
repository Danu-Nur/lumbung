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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getTranslations } from 'next-intl/server';
import { TransferModalManager } from '@/components/domain/transfers/transfer-modal-manager';
import { TransferActions } from '@/components/domain/transfers/transfer-actions';

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
                    <SearchInput className="w-full sm:w-[300px]" placeholder={tCommon('buttons.search')} />
                    <Link href="?modal=create">
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
                                            <TableHead>{t('columns.reference')}</TableHead>
                                            <TableHead>{t('columns.from')}</TableHead>
                                            <TableHead>{t('columns.to')}</TableHead>
                                            <TableHead>{t('columns.date')}</TableHead>
                                            <TableHead>{t('columns.status')}</TableHead>
                                            <TableHead className="text-right">{t('columns.items')}</TableHead>
                                            <TableHead className="text-right">{tCommon('table.actions')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {serializedTransfers.map((transfer) => (
                                            <TableRow key={transfer.id}>
                                                <TableCell className="font-medium">
                                                    {transfer.transferNumber}
                                                </TableCell>
                                                <TableCell>
                                                    {transfer.fromWarehouse.name}
                                                </TableCell>
                                                <TableCell>
                                                    {transfer.toWarehouse.name}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(transfer.transferDate)}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transfer.status === 'DRAFT'
                                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                                                            : transfer.status === 'IN_TRANSIT'
                                                                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                                : transfer.status === 'COMPLETED'
                                                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                                                    : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                                            }`}
                                                    >
                                                        {transfer.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {transfer.items.length}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <TransferActions transfer={transfer} />
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
