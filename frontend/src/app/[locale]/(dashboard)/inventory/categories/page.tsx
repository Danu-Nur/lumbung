import { auth } from '@/lib/auth';
import { CategoriesListSection } from '@/components/domain/categories/sections/categories-list-section';

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

    return (
        <div className="w-full space-y-6">
            <h1 className="text-2xl font-bold">Categories</h1>
            <div className="min-h-[500px]">
                <CategoriesListSection
                    page={page}
                    pageSize={pageSize}
                    search={search}
                    organizationId={(session?.user as any)?.organizationId || ''}
                />
            </div>
        </div>
    );
}
