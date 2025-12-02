import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
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
import { Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { CustomerDialog } from '@/components/domain/customers/customer-dialog';
import { CustomerActions } from '@/components/domain/customers/customer-actions';

import { PageHelp } from '@/components/shared/page-help';
import { getTranslations } from 'next-intl/server';
import { customerService } from '@/lib/services/customerService';
import { SearchInput } from '@/components/shared/search-input';
import { Pagination } from '@/components/shared/pagination';
import { PageHeader } from '@/components/shared/page-header';

export default async function CustomersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; pageSize?: string; q?: string }>;
}) {
    const session = await auth();
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = Number(resolvedSearchParams.pageSize) || 10;
    const search = resolvedSearchParams.q || '';

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
                    <CustomerDialog
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

                    {customers.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                {tCommon('table.noData')}
                            </p>
                            <CustomerDialog
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
