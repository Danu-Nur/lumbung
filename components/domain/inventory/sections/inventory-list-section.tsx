import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { inventoryService } from '@/lib/services/inventoryService';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { formatCurrency } from '@/lib/utils';
import { Package, Plus } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { InventoryModalManager } from '@/components/domain/inventory/inventory-modal-manager';
import { InventoryActions } from '@/components/domain/inventory/inventory-actions';
import { prisma } from '@/lib/prisma';
import { InventoryTable } from '@/components/domain/inventory/tables/inventory-table';
import { ImportModal } from '@/components/shared/import-modal';
import { importStockBatch } from '@/features/inventory/import-actions';

interface InventoryListSectionProps {
    page: number;
    pageSize: number;
    search: string;
}

export async function InventoryListSection({ page, pageSize, search }: InventoryListSectionProps) {
    const session = await auth();
    const t = await getTranslations('inventory');
    const tCommon = await getTranslations('common');

    if (!session?.user) {
        redirect('/login');
    }

    if (!session.user.organizationId) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">
                    Super Admin: Select an organization to view inventory
                </p>
            </div>
        );
    }

    const [inventoryData, categories, warehouses] = await Promise.all([
        inventoryService.getInventory(
            session.user.organizationId,
            page,
            pageSize,
            search
        ),
        prisma.category.findMany({
            where: { organizationId: session.user.organizationId, deletedAt: null },
            orderBy: { name: 'asc' },
        }),
        prisma.warehouse.findMany({
            where: { organizationId: session.user.organizationId, deletedAt: null, isActive: true },
            orderBy: { name: 'asc' },
        }),
    ]);

    const { products, total } = inventoryData;

    const totalPages = Math.ceil(total / pageSize);

    // Serialize Decimal fields for client component
    const serializedProducts = products.map((product) => ({
        ...product,
        sellingPrice: Number(product.sellingPrice),
        costPrice: Number(product.costPrice),
    }));

    return (
        <div className="space-y-4">
            <InventoryModalManager products={serializedProducts} categories={categories} warehouses={warehouses} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{t('tabs.stock')}</h2>
                    <p className="text-sm text-muted-foreground">{t('help.purpose.content')}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* <SearchInput className="w-full sm:w-[300px]" placeholder={`${tCommon('buttons.search')}...`} /> */}
                    <ImportModal
                        type="stock"
                        onImport={importStockBatch}
                        sampleData={[
                            {
                                Name: 'Product A',
                                SKU: 'SKU123',
                                Barcode: '881234567890',
                                Description: 'Description of Product A',
                                Category: 'General',
                                Warehouse: 'Main',
                                Quantity: 100,
                                Unit: 'pcs',
                                'Cost Price': 1000,
                                'Selling Price': 1500,
                                'Min Stock': 10
                            }
                        ]}
                    />
                    <Link href="?view=stock&modal=create">
                        <Button className="shrink-0 w-10 h-10 p-0 sm:w-auto sm:h-10 sm:px-4 sm:py-2">
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">{tCommon('buttons.add')} {t('columns.product')}</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {serializedProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                {tCommon('table.noData')}
                            </p>
                            <Link href="?view=stock&modal=create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {tCommon('buttons.add')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full overflow-auto p-4">
                                <InventoryTable data={serializedProducts} warehouses={warehouses} />
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
        </div >
    );
}
