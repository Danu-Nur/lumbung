import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
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
import { getTranslations } from 'next-intl/server';
import { customerService } from '@/lib/services/customerService';
import { SearchInput } from '@/components/shared/search-input';
import { Pagination } from '@/components/shared/pagination';

interface CustomerListSectionProps {
    page: number;
    pageSize: number;
    search: string;
}

export async function CustomerListSection({ page, pageSize, search }: CustomerListSectionProps) {
    const session = await auth();
    const t = await getTranslations('customers');
    const tCommon = await getTranslations('common');

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const { customers, total, totalPages } = await customerService.listCustomers({
        organizationId: session.user.organizationId,
        page,
        pageSize,
        search,
    });

    return (
        <div className="space-y-6">
            <CustomerModalManager customers={customers} />

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
                                        {customers.map((customer) => (
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
