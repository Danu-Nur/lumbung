import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { categoryService } from '@/lib/services/categoryService';
import { Pagination } from '@/components/shared/pagination';
import { SearchInput } from '@/components/shared/search-input';
import { Package, Plus } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { CategoryModalManager } from '@/components/domain/categories/category-modal-manager';
import { CategoriesTable } from '@/components/domain/categories/tables/categories-table';
import { ImportModal } from '@/components/shared/import-modal';
import { importCategoriesBatch } from '@/features/categories/import-actions';

interface CategoriesListSectionProps {
    page: number;
    pageSize: number;
    search: string;
    organizationId: string;
}

export async function CategoriesListSection({ page, pageSize, search, organizationId }: CategoriesListSectionProps) {
    // const session = await auth(); // Removed legacy auth
    const t = await getTranslations('inventory.categories');
    const tCommon = await getTranslations('common');

    if (!organizationId) {
        redirect('/login');
    }

    const { data: categories, total, totalPages } = await categoryService.listCategories({
        organizationId: organizationId,
        search,
        page,
        pageSize,
    });

    return (
        <div className="space-y-4">
            <CategoryModalManager categories={categories} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{t('title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('description')}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* <SearchInput className="w-full sm:w-[300px]" placeholder={`${tCommon('buttons.search')}...`} /> */}
                    <ImportModal
                        type="categories"
                        onImport={importCategoriesBatch}
                        sampleData={[{ Name: 'Electronics', Description: 'Devices' }, { Name: 'Food', Description: 'Groceries' }]}
                    />
                    <Link href="?view=categories&modal=create">
                        <Button className="shrink-0 w-10 h-10 p-0 sm:w-auto sm:h-10 sm:px-4 sm:py-2">
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">{tCommon('buttons.add')} {t('title')}</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {categories.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">
                                {tCommon('table.noData')}
                            </p>
                            <Link href="?view=categories&modal=create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {tCommon('buttons.add')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="relative w-full overflow-auto p-4">
                                <CategoriesTable data={categories} />
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
