'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';
import { Pagination } from '@/components/shared/pagination';
import { useTranslations } from 'next-intl';
import { TransferModalManager } from '@/components/domain/transfers/transfer-modal-manager';
import { TransferTable } from '@/components/domain/inventory/tables/transfer-table';
import { ImportModal } from '@/components/shared/import-modal';
import { importTransferBatch } from '@/features/transfers/import-actions';
import { LoadingState } from '@/components/shared/loading-state';

interface InventoryTransferSectionProps {
    page: number;
    pageSize: number;
    search: string;
    modal?: string;
    id?: string;
    organizationId: string;
}

export function InventoryTransferSection({ page, pageSize, search, modal, id, organizationId }: InventoryTransferSectionProps) {
    const t = useTranslations('inventory.transfers');
    const tInventory = useTranslations('inventory');
    const tCommon = useTranslations('common');

    // Transfers query
    const { data: transfersData, isLoading } = useQuery({
        queryKey: ['transfers', page, pageSize, search],
        queryFn: async () => {
            const res = await api.get('/inventory/transfers', {
                params: { page, pageSize, q: search }
            });
            return res.data; // { transfers, total }
        }
    });

    const shouldFetchOptions = modal === 'create' || modal === 'edit';

    // Options for modals
    const { data: warehouses = [] } = useQuery({
        queryKey: ['warehouses-options'],
        enabled: shouldFetchOptions,
        queryFn: async () => {
            const res = await api.get('/warehouses');
            return res.data.warehouses || [];
        }
    });

    const { data: products = [] } = useQuery({
        queryKey: ['products-options'],
        enabled: shouldFetchOptions,
        queryFn: async () => {
            const res = await api.get('/products');
            return res.data.products || [];
        }
    });

    if (isLoading) return <LoadingState message={tCommon('table.loading') || 'Loading...'} />;

    const transfers = transfersData?.transfers || [];
    const total = transfersData?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    // Get selected transfer for show/edit modals
    const selectedTransfer = (modal === 'show' || modal === 'edit') && id
        ? transfers.find((t: any) => t.id === id)
        : undefined;

    // Serialize selected transfer for modal (full data - Decimal fields)
    const serializedSelectedTransfer = selectedTransfer ? {
        ...selectedTransfer,
        items: selectedTransfer.items.map((item: any) => ({
            ...item,
            product: {
                ...item.product,
                sellingPrice: Number(item.product.sellingPrice),
                costPrice: Number(item.product.costPrice),
            },
        })),
    } : undefined;

    // In a real scenario, we might need a separate GET by ID if the list doesn't have all data,
    // but our backend getTransfers service includes items and product details.

    return (
        <div className="space-y-4">
            <TransferModalManager
                transfers={transfers as any}
                selectedTransfer={serializedSelectedTransfer as any}
                warehouses={warehouses}
                products={products}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{tInventory('tabs.transfers')}</h2>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
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
                    {transfers.length === 0 ? (
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
                                <TransferTable data={transfers as any} />
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
