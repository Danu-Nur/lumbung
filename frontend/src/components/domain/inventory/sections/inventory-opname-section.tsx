

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { getTranslations } from 'next-intl/server';
import { OpnameTable } from '@/components/domain/inventory/tables/opname-table';
import { CreateOpnameDialog } from '@/components/domain/inventory/modals/create-opname-dialog';
import { SerializedStockOpname, SerializedStockOpnameItem } from '@/types/serialized';
import { ImportModal } from '@/components/shared/import-modal';
// import { importOpnameBatch } from '@/features/opnames/import-actions';

interface InventoryOpnameSectionProps {
    page: number;
    pageSize: number;
    search: string;
    modal?: string;
    id?: string;
    organizationId: string;
}

export async function InventoryOpnameSection({ page, pageSize, search, modal, id, organizationId }: InventoryOpnameSectionProps) {
    const t = await getTranslations('inventory.opname');
    const tCommon = await getTranslations('common');


    if (!organizationId) {
        redirect('/login');
    }

    const skip = (page - 1) * pageSize;
    const where: any = {
        organizationId: organizationId,
    };

    if (search) {
        where.opnameNumber = { contains: search };
    }

    const [opnames, total, warehouses] = await Promise.all([
        prisma.stockOpname.findMany({
            where,
            include: {
                warehouse: true,
                items: {
                    select: {
                        id: true,
                        actualQty: true
                    }
                },
                createdBy: true,
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize,
        }),
        prisma.stockOpname.count({
            where,
        }),
        prisma.warehouse.findMany({
            where: { organizationId: organizationId, isActive: true },
            select: { id: true, name: true }
        })
    ]);

    const totalPages = Math.ceil(total / pageSize);

    // Serialize Decimal fields
    const serializedOpnames: any[] = opnames.map((op: any) => ({
        ...op,
        items: op.items // No product mapping needed as we didn't fetch it
    }));

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{t('title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* <SearchInput className="w-full sm:w-[300px]" placeholder={tCommon('buttons.search')} /> */}
                    <ImportModal
                        type="opname"
                        onImport={async () => ({ success: true })}
                        sampleData={[{
                            'Opname Number': 'OP-001',
                            'Warehouse': 'Main Warehouse',
                            'Product Name': 'Product A',
                            'SKU': 'SKU-001',
                            'Actual Qty': 50,
                            'Notes': 'End of Year Count'
                        }]}
                    />
                    <CreateOpnameDialog warehouses={warehouses} />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {serializedOpnames.length === 0 ? (
                        <div className="text-center py-12">
                            <ClipboardList className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                {tCommon('table.noData')}
                            </p>
                            <CreateOpnameDialog warehouses={warehouses} />
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full overflow-auto p-4">
                                <OpnameTable data={serializedOpnames} />
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
