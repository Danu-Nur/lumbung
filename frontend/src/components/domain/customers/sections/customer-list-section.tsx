'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { CustomerModalManager } from '@/components/domain/customers/customer-modal-manager';
import { CustomerActions } from '@/components/domain/customers/customer-actions';
import { customerService } from '@/lib/services/customerService';
import { Pagination } from '@/components/shared/pagination';
import { LoadingState } from '@/components/shared/loading-state';

interface CustomerListSectionProps {
    page: number;
    pageSize: number;
    search: string;
    organizationId: string;
    accessToken: string;
}

export function CustomerListSection({ page, pageSize, search, organizationId, accessToken }: CustomerListSectionProps) {
    const t = useTranslations('customers');
    const tCommon = useTranslations('common');
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['customers', page, pageSize, search],
        queryFn: () => customerService.listCustomers({
            organizationId,
            page,
            pageSize,
            search,
            token: accessToken
        }),
    });

    if (isLoading) return <LoadingState />;

    const customers = data?.customers || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-6">
            <CustomerModalManager
                customers={customers}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['customers'] });
                }}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{t('title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link href="?view=customers&modal=create">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            {tCommon('buttons.add')} {t('title')}
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {customers.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                {tCommon('table.noData')}
                            </p>
                            <Link href="?view=customers&modal=create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {tCommon('buttons.add')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full overflow-auto p-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('columns.name')}</TableHead>
                                            <TableHead>{t('columns.email')}</TableHead>
                                            <TableHead>{t('columns.phone')}</TableHead>
                                            <TableHead>{t('columns.city')}</TableHead>
                                            <TableHead className="w-[100px]">{tCommon('table.actions')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customers.map((customer: any) => (
                                            <TableRow key={customer.id}>
                                                <TableCell className="font-medium">
                                                    {customer.name}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {customer.email || '-'}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {customer.phone || '-'}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {customer.city || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <CustomerActions customer={customer} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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
