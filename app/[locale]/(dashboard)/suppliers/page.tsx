import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { supplierService } from '@/lib/services/supplierService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Building2 } from 'lucide-react';
import { SupplierDialog } from '@/components/domain/suppliers/supplier-dialog';
import { SupplierActions } from '@/components/domain/suppliers/supplier-actions';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';

import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';

export default async function SuppliersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; pageSize?: string; q?: string }>;
}) {
    const session = await auth();
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = Number(resolvedSearchParams.pageSize) || 10;
    const search = resolvedSearchParams.q || '';

    const t = await getTranslations('suppliers');
    const tCommon = await getTranslations('common');

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const { suppliers, total, totalPages } = await supplierService.listSuppliers({
        organizationId: session.user.organizationId,
        page,
        pageSize,
        search,
    });


    const helpSections = [
        {
            heading: t('help.purpose.heading'),
            content: t('help.purpose.content'),
        },
        {
            heading: 'Penjelasan Kolom', // TODO: Add to translations
            content: (
                <ul className="list-disc pl-4 space-y-2">
                    <li><strong>{t('columns.name')}:</strong> {t('columns.name')}</li>
                    <li><strong>{t('columns.email')}/{t('columns.phone')}:</strong> {t('columns.email')} / {t('columns.phone')}</li>
                    <li><strong>{t('columns.city')}:</strong> {t('columns.city')}</li>
                </ul>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('title')}
                description={t('description')}
                help={{
                    title: t('help.title'),
                    sections: helpSections,
                }}
                actions={
                    <SupplierDialog
                        trigger={
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                {tCommon('buttons.add')} {t('title')}
                            </Button>
                        }
                    />
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                        <SearchInput placeholder={`${tCommon('buttons.search')}...`} />
                    </div>

                    {suppliers.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                {tCommon('table.noData')}
                            </p>
                            <SupplierDialog
                                trigger={
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        {tCommon('buttons.add')}
                                    </Button>
                                }
                            />
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('columns.name')}</TableHead>
                                        <TableHead>{t('columns.email')}</TableHead>
                                        <TableHead>{t('columns.phone')}</TableHead>
                                        <TableHead>{t('columns.city')}</TableHead>
                                        <TableHead className="text-right">{tCommon('table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {suppliers.map((supplier) => (
                                        <TableRow key={supplier.id}>
                                            <TableCell className="font-medium">
                                                {supplier.name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {supplier.email || '-'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {supplier.phone || '-'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {supplier.city || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <SupplierActions supplier={supplier} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                pageSize={pageSize}
                                totalItems={total}
                            />
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

