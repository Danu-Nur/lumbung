'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2 } from 'lucide-react';
import Link from 'next/link';
import { SupplierModalManager } from '@/components/domain/suppliers/supplier-modal-manager';
import { SupplierTable } from '@/components/domain/suppliers/tables/supplier-table';
import { Pagination } from '@/components/shared/pagination';
import { useTranslations } from 'next-intl';
import { LoadingState } from '@/components/shared/loading-state';

interface SupplierListSectionProps {
    page: number;
    pageSize: number;
    search: string;
    organizationId: string;
}

export function SupplierListSection({ page, pageSize, search, organizationId }: SupplierListSectionProps) {
    const t = useTranslations('inventory.suppliers');
    const tCommon = useTranslations('common');

    const { data, isLoading } = useQuery({
        queryKey: ['suppliers', page, pageSize, search],
        queryFn: async () => {
            const res = await api.get('/suppliers', {
                params: { page, pageSize, q: search }
            });
            return res.data; // Expecting { suppliers, total }
        }
    });

    if (isLoading) return <LoadingState message={tCommon('table.loading') || 'Loading...'} />;

    const suppliers = data?.suppliers || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-6">
            <SupplierModalManager suppliers={suppliers} />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{t('title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link href="?view=suppliers&modal=create">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            {tCommon('buttons.add')}
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {suppliers.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                {tCommon('table.noData')}
                            </p>
                            <Link href="?view=suppliers&modal=create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {tCommon('buttons.add')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full overflow-auto p-4">
                                <SupplierTable data={suppliers} />
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
