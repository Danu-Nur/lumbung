import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { categoryService } from '@/lib/services/categoryService';
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
import { Plus } from 'lucide-react';
import { CategoryDialog } from '@/components/domain/categories/category-dialog';
import { CategoryActions } from '@/components/domain/categories/category-actions';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { PageHeader } from '@/components/shared/page-header';
import { getTranslations } from 'next-intl/server';

export default async function CategoriesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; pageSize?: string; q?: string }>;
}) {
    const session = await auth();
    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = Number(resolvedSearchParams.pageSize) || 10;
    const search = resolvedSearchParams.q || '';

    const t = await getTranslations('categories');
    const tCommon = await getTranslations('common');

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const { data: categories, total, totalPages } = await categoryService.listCategories({
        organizationId: session.user.organizationId,
        search,
        page,
        pageSize,
    });


    const helpSections = [
        {
            heading: t('help.purpose.heading'),
            content: t('help.purpose.content'),
        },
        {
            heading: 'Penjelasan Kolom', // TODO: Add to translations if missing or use generic help keys
            content: (
                <ul className="list-disc pl-4 space-y-2">
                    <li><strong>{t('columns.name')}:</strong> {t('columns.name')}</li>
                    <li><strong>{t('columns.description')}:</strong> {t('columns.description')}</li>
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
                    <CategoryDialog
                        trigger={
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> {tCommon('buttons.add')} {t('title')}
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

                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('columns.name')}</TableHead>
                                    <TableHead>{t('columns.description')}</TableHead>
                                    <TableHead className="w-[100px]">{tCommon('table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-10">
                                            {tCommon('table.noData')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell>{category.description}</TableCell>
                                            <TableCell>
                                                <CategoryActions category={category} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalItems={total}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

