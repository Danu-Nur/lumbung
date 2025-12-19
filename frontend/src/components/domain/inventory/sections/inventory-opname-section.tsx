'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ClipboardList } from 'lucide-react';
import { Pagination } from '@/components/shared/pagination';
import { useTranslations } from 'next-intl';
import { OpnameTable } from '@/components/domain/inventory/tables/opname-table';
import { CreateOpnameDialog } from '@/components/domain/inventory/modals/create-opname-dialog';
import { ImportModal } from '@/components/shared/import-modal';
import { importOpnameBatch } from '@/features/inventory/opname-import-actions';
import { LoadingState } from '@/components/shared/loading-state';

interface InventoryOpnameSectionProps {
    page: number;
    pageSize: number;
    search: string;
    modal?: string;
    id?: string;
    organizationId: string;
}

export function InventoryOpnameSection({ page, pageSize, search, modal, id, organizationId }: InventoryOpnameSectionProps) {
    const t = useTranslations('inventory.opname');
    const tCommon = useTranslations('common');

    // Opnames query
    const { data: opnamesData, isLoading } = useQuery({
        queryKey: ['opnames', page, pageSize, search],
        queryFn: async () => {
            const res = await api.get('/inventory/opnames', {
                params: { page, pageSize, q: search }
            });
            return res.data; // { opnames, total }
        }
    });

    // Warehouses query for creation
    const { data: warehouses = [] } = useQuery({
        queryKey: ['warehouses-options-opname'],
        queryFn: async () => {
            const res = await api.get('/warehouses');
            return res.data.warehouses || [];
        }
    });

    if (isLoading) return <LoadingState message={tCommon('table.loading') || 'Loading...'} />;

    const opnames = opnamesData?.opnames || [];
    const total = opnamesData?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{t('title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <ImportModal
                        type="opname"
                        onImport={importOpnameBatch}
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
                    {opnames.length === 0 ? (
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
                                <OpnameTable data={opnames} />
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
