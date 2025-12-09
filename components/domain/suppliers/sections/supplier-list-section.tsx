import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { supplierService } from '@/lib/services/supplierService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Building2 } from 'lucide-react';
import Link from 'next/link';
import { SupplierModalManager } from '@/components/domain/suppliers/supplier-modal-manager';
import { SupplierActions } from '@/components/domain/suppliers/supplier-actions';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';

interface SupplierListSectionProps {
    page: number;
    pageSize: number;
    search: string;
}

export async function SupplierListSection({ page, pageSize, search }: SupplierListSectionProps) {
    const session = await auth();
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
