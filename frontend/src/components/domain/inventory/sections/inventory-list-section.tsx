'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/shared/pagination';
import { formatCurrency } from '@/lib/utils';
import { Package, Plus } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { InventoryModalManager } from '@/components/domain/inventory/inventory-modal-manager';
import { InventoryTable } from '@/components/domain/inventory/tables/inventory-table';
import { ImportModal } from '@/components/shared/import-modal';
// import { importStockBatch } from '@/features/inventory/import-actions'; // Moved or Refactored?

interface InventoryListSectionProps {
    page: number;
    pageSize: number;
    search: string;
    modal?: string;
    id?: string;
}

export function InventoryListSection({ page, pageSize, search, modal, id }: InventoryListSectionProps) {
    const t = useTranslations('inventory');
    const tCommon = useTranslations('common');

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products', page, pageSize, search],
        queryFn: async () => {
            try {
                // In real app, pass params to API for filtration
                const res = await api.get('/products');
                // Cache to Dexie (Offline First)
                await db.products.bulkPut(res.data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    sku: p.sku,
                    sellingPrice: Number(p.sellingPrice),
                    updatedAt: new Date().toISOString()
                })));
                return res.data;
            } catch (error) {
                console.warn('Offline mode or API error, fetching from local DB');
                return await db.products.toArray();
            }
        }
    });

    // Mock other data needed for Modals (should be fetched too)
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => [] // Placeholder
    });
    const { data: warehouses = [] } = useQuery({
        queryKey: ['warehouses'],
        queryFn: async () => []
    });
    const { data: suppliers = [] } = useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => []
    });

    const total = products.length; // Client-side pagination for MVP
    const totalPages = Math.ceil(total / pageSize);

    if (isLoading) return <div>Loading...</div>;

    const serializedProducts = products.map((product: any) => ({
        ...product,
        sellingPrice: Number(product.sellingPrice),
        costPrice: Number(product.costPrice),
    }));

    return (
        <div className="space-y-4">
            <InventoryModalManager
                products={serializedProducts}
                categories={categories}
                warehouses={warehouses}
                suppliers={suppliers}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{t('tabs.stock')}</h2>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* <SearchInput className="w-full sm:w-[300px]" placeholder={`${tCommon('buttons.search')}...`} /> */}
                    {/* Placeholder for Import */}
                    <Link href="?view=stock&modal=create">
                        <Button className="shrink-0 w-10 h-10 p-0 sm:w-auto sm:h-10 sm:px-4 sm:py-2">
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">{tCommon('buttons.add')}</span>
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
