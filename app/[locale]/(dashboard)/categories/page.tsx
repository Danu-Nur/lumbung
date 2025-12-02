import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
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
import { Plus, Search } from 'lucide-react';
import { CategoryDialog } from '@/components/categories/category-dialog';
import { CategoryActions } from '@/components/categories/category-actions';
import { Pagination } from '@/components/shared/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { PageHelp } from '@/components/shared/page-help';
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

    const where = {
        organizationId: session.user.organizationId,
        deletedAt: null,
        name: {
            contains: search,
            mode: 'insensitive' as const,
        },
    };

    const [categories, total] = await prisma.$transaction([
        prisma.category.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.category.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);


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
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                        <PageHelp title={t('help.title')} sections={helpSections} />
                    </div>
                    <p className="text-muted-foreground mt-1">
                        {t('description')}
                    </p>
                </div>
                <CategoryDialog
                    trigger={
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> {tCommon('buttons.add')} {t('title')}
                        </Button>
                    }
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <form>
                                <Input
                                    name="q"
                                    placeholder={`${tCommon('buttons.search')}...`}
                                    className="pl-8"
                                    defaultValue={search}
                                />
                            </form>
                        </div>
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

