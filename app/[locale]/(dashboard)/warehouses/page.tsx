import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Warehouse as WarehouseIcon } from 'lucide-react';
import Link from 'next/link';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
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
import { WarehouseModalManager } from '@/components/domain/warehouses/warehouse-modal-manager';
import { WarehouseActions } from '@/components/domain/warehouses/warehouse-actions';

async function getWarehouses(organizationId: string, page: number = 1, pageSize: number = 10, query: string = '') {
    const skip = (page - 1) * pageSize;
    const where: any = {
        organizationId,
        deletedAt: null,
    };

    if (query) {
        where.OR = [
            { name: { contains: query } },
            { code: { contains: query } },
            { city: { contains: query } },
            { address: { contains: query } },
        ];
    }

    const [warehouses, total] = await Promise.all([
        prisma.warehouse.findMany({
            where,
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
            where,
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
    const query = params?.q?.toString() || '';

    const { warehouses, total } = await getWarehouses(session.user.organizationId, page, pageSize, query);
    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="space-y-6">
            <WarehouseModalManager warehouses={warehouses} />
            <PageHeader
                title={t('title')}
                description={t('description')}
                help={{
                    title: t('help.title'),
                    children: (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-base mb-1">{t('help.purpose.heading')}</h3>
                                <div className="text-sm text-muted-foreground">{t('help.purpose.content')}</div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-base mb-1">Features</h3>
                                <div className="text-sm text-muted-foreground">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li><strong>Add Warehouse:</strong> Create new storage locations.</li>
                                        <li><strong>Active Status:</strong> Toggle warehouses on/off.</li>
                                        <li><strong>Inventory:</strong> View stock levels per warehouse.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )
                }}
                actions={
                    <div className="flex items-center gap-2">
                        <SearchInput placeholder={tCommon('buttons.search')} />
                        <Link href="?modal=create">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                {tCommon('buttons.add')}
                            </Button>
                        </Link>
                    </div>
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
                            <Link href="?modal=create">
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
                                                <WarehouseActions warehouse={warehouse} />
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
