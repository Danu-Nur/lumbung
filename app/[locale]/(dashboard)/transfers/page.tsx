import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { PageHeader } from '@/components/shared/page-header';
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

async function getTransfers(organizationId: string, page: number = 1, pageSize: number = 10, query: string = '') {
    const skip = (page - 1) * pageSize;
    const where: any = {
        organizationId,
    };

    if (query) {
        where.OR = [
            { transferNumber: { contains: query } },
            { fromWarehouse: { name: { contains: query } } },
            { toWarehouse: { name: { contains: query } } },
        ];
    }

    const [transfers, total] = await Promise.all([
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
    ]);

    return { transfers, total };
}

interface TransfersPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TransfersPage({ searchParams }: TransfersPageProps) {
    const session = await auth();
    const t = await getTranslations('transfers');
    const tCommon = await getTranslations('common');

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const pageSize = Number(params?.pageSize) || 10;
    const query = params?.q?.toString() || '';

    const [transferData, warehouses, products] = await Promise.all([
        getTransfers(session.user.organizationId, page, pageSize, query),
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

    const { transfers, total } = transferData;
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
        <div className="space-y-6">
            <TransferModalManager
                transfers={serializedTransfers}
                warehouses={warehouses}
                products={products}
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
                                        <li><strong>Create Transfer:</strong> Move stock from one warehouse to another.</li>
                                        <li><strong>Send:</strong> Deduct stock from source warehouse (In Transit).</li>
                                        <li><strong>Complete:</strong> Add stock to destination warehouse.</li>
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
