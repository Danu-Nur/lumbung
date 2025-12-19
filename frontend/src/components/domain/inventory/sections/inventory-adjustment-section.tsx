'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Pagination } from '@/components/shared/pagination';
import { useTranslations } from 'next-intl';
import { AdjustmentModalManager } from '@/components/domain/adjustments/adjustment-modal-manager';
import { AdjustmentTable } from '@/components/domain/inventory/tables/adjustment-table';
import { ImportModal } from '@/components/shared/import-modal';
import { importAdjustmentBatch } from '@/features/adjustments/import-actions';
import { LoadingState } from '@/components/shared/loading-state';

interface InventoryAdjustmentSectionProps {
    page: number;
    pageSize: number;
    search: string;
    modal?: string;
    id?: string;
    organizationId: string;
}

export function InventoryAdjustmentSection({ page, pageSize, search, modal, id, organizationId }: InventoryAdjustmentSectionProps) {
    const t = useTranslations('inventory.adjustments');
    const tInventory = useTranslations('inventory');
    const tCommon = useTranslations('common');

    // Adjustments query
    const { data: adjustmentsData, isLoading } = useQuery({
        queryKey: ['adjustments', page, pageSize, search],
        queryFn: async () => {
            const res = await api.get('/inventory/adjustments', {
                params: { page, pageSize, q: search }
            });
            return res.data; // { adjustments, total }
        }
    });

    const shouldFetchOptions = modal === 'create' || modal === 'edit';

    // Options for modals
    const { data: products = [] } = useQuery({
        queryKey: ['products-options-adj'],
        enabled: shouldFetchOptions,
        queryFn: async () => {
            const res = await api.get('/products');
            return res.data.products || [];
        }
    });

    const { data: warehouses = [] } = useQuery({
        queryKey: ['warehouses-options-adj'],
        enabled: shouldFetchOptions,
        queryFn: async () => {
            const res = await api.get('/warehouses');
            return res.data.warehouses || [];
        }
    });

    if (isLoading) return <LoadingState message={tCommon('table.loading') || 'Loading...'} />;

    const adjustments = adjustmentsData?.adjustments || [];
    const total = adjustmentsData?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    // Serialize Decimal fields for client component
    const serializedAdjustments = adjustments.map((adjustment: any) => ({
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
