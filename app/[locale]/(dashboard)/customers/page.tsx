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
import { CustomerDialog } from '@/components/customers/customer-dialog';
import { CustomerActions } from '@/components/customers/customer-actions';

import { PageHelp } from '@/components/shared/page-help';
import { getTranslations } from 'next-intl/server';

async function getCustomers(organizationId: string) {
    return await prisma.customer.findMany({
        where: { organizationId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
    });
}

export default async function CustomersPage() {
    const session = await auth();
    const t = await getTranslations('customers');
    const tCommon = await getTranslations('common');

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const customers = await getCustomers(session.user.organizationId);

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
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-foreground">
                            {t('title')}
                        </h1>
                        <PageHelp title={t('help.title')} sections={helpSections} />
                    </div>
                    <p className="text-muted-foreground mt-1">
                        {t('description')}
                    </p>
                </div>
                <CustomerDialog
                    trigger={
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            {tCommon('buttons.add')} {t('title')}
                        </Button>
                    }
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                </CardHeader>
                <CardContent>
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
