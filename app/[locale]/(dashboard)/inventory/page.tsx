import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { inventoryService } from '@/lib/services/inventoryService';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { formatCurrency } from '@/lib/utils';
import { Package, Plus } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';

export default async function InventoryPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; pageSize?: string; q?: string }>;
}) {
    const session = await auth();
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = Number(resolvedSearchParams.pageSize) || 10;
    const search = resolvedSearchParams.q || '';

    const t = await getTranslations('inventory');
    const tCommon = await getTranslations('common');

    if (!session?.user) {
        redirect('/login');
    }

    if (!session.user.organizationId) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">
                    Super Admin: Select an organization to view inventory
                </p>
            </div>
        );
    }

    const { products, total } = await inventoryService.getInventory(
        session.user.organizationId,
        page,
        pageSize,
        search
    );

    const totalPages = Math.ceil(total / pageSize);

    const helpSections = [
        {
            heading: t('help.purpose.heading'),
            content: t('help.purpose.content'),
        },
        {
            heading: t('help.columns.heading'),
            content: (
                <ul className="list-disc pl-4 space-y-2">
                    <li><strong>{t('help.columns.product')}:</strong> {t('columns.product')}</li>
                    <li><strong>{t('help.columns.warehouse')}:</strong> {t('columns.warehouse')}</li>
                    <li><strong>{t('help.columns.available')}:</strong> {t('columns.available')}</li>
                    <li><strong>{t('help.columns.ordered')}:</strong> {t('columns.ordered')}</li>
                    <li><strong>{t('help.columns.minStock')}:</strong> {t('columns.minStock')}</li>
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
                    <>
                        <Link href="/adjustments">
                            <Button variant="outline">{tCommon('nav.adjustments')}</Button>
                        </Link>
                        <Link href="/inventory/new">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> {tCommon('buttons.add')} {t('columns.product')}
                            </Button>
                        </Link>
                    </>
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

                    {products.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                {tCommon('table.noData')}
                            </p>
                            <Link href="/inventory/new">
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
                                        <TableHead>{t('columns.product')}</TableHead>
                                        <TableHead>{t('columns.sku')}</TableHead>
                                        <TableHead>{t('columns.category')}</TableHead>
                                        <TableHead className="text-right">{t('columns.sellingPrice')}</TableHead>
                                        <TableHead className="text-right">{t('columns.totalStock')}</TableHead>
                                        <TableHead className="text-right">{tCommon('table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => {
                                        const totalStock = product.inventoryItems.reduce(
                                            (sum, item) => sum + item.quantityOnHand,
                                            0
                                        );
                                        const isLowStock = totalStock <= product.lowStockThreshold;

                                        return (
                                            <TableRow key={product.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {product.name}
                                                        </p>
                                                        {product.description && (
                                                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                                                                {product.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {product.sku}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {product.category?.name || '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(Number(product.sellingPrice))}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant={isLowStock ? 'destructive' : 'default'}>
                                                        {totalStock} {product.unit}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/inventory/${product.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            {tCommon('buttons.view')}
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
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
            </Card >
        </div >
    );
}
