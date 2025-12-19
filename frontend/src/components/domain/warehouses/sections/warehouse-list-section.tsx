'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Warehouse as WarehouseIcon } from 'lucide-react';
import Link from 'next/link';
import { Pagination } from '@/components/shared/pagination';
import { useTranslations } from 'next-intl';
import { WarehouseModalManager } from '@/components/domain/warehouses/warehouse-modal-manager';
import { WarehouseImportButton } from '@/components/domain/warehouses/warehouse-import-button';
import { WarehouseTable } from '../tables/warehouse-table';
import { LoadingState } from '@/components/shared/loading-state';

interface WarehouseListSectionProps {
    page: number;
    pageSize: number;
    search: string;
    organizationId: string;
}

export function WarehouseListSection({ page, pageSize, search, organizationId }: WarehouseListSectionProps) {
    const t = useTranslations('inventory.warehouses');
    const tCommon = useTranslations('common');

    const { data, isLoading } = useQuery({
        queryKey: ['warehouses', page, pageSize, search],
        queryFn: async () => {
            const res = await api.get('/warehouses', {
                params: { page, pageSize, q: search }
            });
            return res.data; // Expecting { warehouses, total }
        }
    });

    if (isLoading) return <LoadingState message={tCommon('table.loading') || 'Loading...'} />;

    const warehouses = data?.warehouses || [];
    const total = data?.total || 0;
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
