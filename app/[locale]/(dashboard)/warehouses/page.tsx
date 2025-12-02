import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Warehouse as WarehouseIcon } from 'lucide-react';
import Link from 'next/link';
import { Pagination } from '@/components/shared/pagination';
import { PageHeader } from '@/components/shared/page-header';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { getTranslations } from 'next-intl/server';

async function getWarehouses(organizationId: string, page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize;
    const [warehouses, total] = await Promise.all([
        prisma.warehouse.findMany({
            where: {
                organizationId,
                deletedAt: null,
            },
            include: {
                _count: {
                    select: { inventoryItems: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize,
        }),
        prisma.warehouse.count({
            where: {
                organizationId,
                deletedAt: null,
            },
        }),
    ]);

    return { warehouses, total };
}

interface WarehousesPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function WarehousesPage({ searchParams }: WarehousesPageProps) {
    const session = await auth();
    const t = await getTranslations('warehouses');
    const tCommon = await getTranslations('common');

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const pageSize = Number(params?.pageSize) || 10;

    const { warehouses, total } = await getWarehouses(session.user.organizationId, page, pageSize);
    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-6">
            <PageHeader
                title={t('title')}
                description={t('description')}
                help={{
                    title: t('help.title'),
                    sections: [
                        {
                            heading: t('help.purpose.heading'),
                            content: t('help.purpose.content'),
                        },
                        {
                            heading: 'Features',
                            content: (
                                <ul className="list-disc list-inside space-y-1">
                                    <li><strong>Add Warehouse:</strong> Create new storage locations.</li>
                                    <li><strong>Active Status:</strong> Toggle warehouses on/off.</li>
                                    <li><strong>Inventory:</strong> View stock levels per warehouse.</li>
                                </ul>
                            ),
                        },
                    ],
                }}
                actions={
                    <Link href="/warehouses/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            {tCommon('buttons.add')}
                        </Button>
                    </Link>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {warehouses.length === 0 ? (
                        <div className="text-center py-12">
                            <WarehouseIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                {tCommon('table.noData')}
                            </p>
                            <Link href="/warehouses/new">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {tCommon('buttons.add')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('columns.name')}</TableHead>
                                        <TableHead>{t('columns.code')}</TableHead>
                                        <TableHead>{t('columns.location')}</TableHead>
                                        <TableHead>{t('columns.items')}</TableHead>
                                        <TableHead>{t('columns.status')}</TableHead>
                                        <TableHead className="text-right">{tCommon('table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {warehouses.map((warehouse) => (
                                        <TableRow key={warehouse.id}>
                                            <TableCell className="font-medium">
                                                {warehouse.name}
                                            </TableCell>
                                            <TableCell>
                                                {warehouse.code}
                                            </TableCell>
                                            <TableCell>
                                                {warehouse.city || warehouse.address || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {warehouse._count.inventoryItems}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={warehouse.isActive ? 'default' : 'secondary'}>
                                                    {warehouse.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/warehouses/${warehouse.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        {tCommon('buttons.edit')}
                                                    </Button>
                                                </Link>
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
