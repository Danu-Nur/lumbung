
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Warehouse as WarehouseIcon } from 'lucide-react';
import Link from 'next/link';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { getTranslations } from 'next-intl/server';
import { WarehouseModalManager } from '@/components/domain/warehouses/warehouse-modal-manager';
import { WarehouseActions } from '@/components/domain/warehouses/warehouse-actions';
import { WarehouseImportButton } from '@/components/domain/warehouses/warehouse-import-button';
import { WarehouseTable } from '../tables/warehouse-table';

interface WarehouseListSectionProps {
    page: number;
    pageSize: number;
    search: string;
    organizationId: string;
}

export async function WarehouseListSection({ page, pageSize, search, organizationId }: WarehouseListSectionProps) {
    // const session = await auth(); // Removed legacy auth
    const t = await getTranslations('inventory.warehouses');
    const tCommon = await getTranslations('common');

    if (!organizationId) {
        redirect('/login');
    }

    const skip = (page - 1) * pageSize;
    const where: any = {
        organizationId: organizationId,
        deletedAt: null,
    };

    if (search) {
        where.OR = [
            { name: { contains: search } },
            { code: { contains: search } },
            { city: { contains: search } },
            { address: { contains: search } },
        ];
    }

    const [warehouses, total] = await Promise.all([
        prisma.warehouse.findMany({
            where,
            include: {
                _count: {
                    select: { inventoryItems: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize,
        }),
        prisma.warehouse.count({
            where,
        }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-4">
            <WarehouseModalManager warehouses={warehouses} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{t('title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* <SearchInput className="w-full sm:w-[300px]" placeholder={tCommon('buttons.search')} /> */}
                    <WarehouseImportButton />
                    <Link href="?view=warehouses&modal=create">
                        <Button className="shrink-0 w-10 h-10 p-0 sm:w-auto sm:h-10 sm:px-4 sm:py-2">
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">{tCommon('buttons.add')}</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {warehouses.length === 0 ? (
                        <div className="text-center py-12">
                            <WarehouseIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                {tCommon('table.noData')}
                            </p>
                            <div className="flex justify-center gap-2">
                                <WarehouseImportButton />
                                <Link href="?view=warehouses&modal=create">
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        {tCommon('buttons.add')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full overflow-auto p-4">
                                <WarehouseTable data={warehouses} />
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
