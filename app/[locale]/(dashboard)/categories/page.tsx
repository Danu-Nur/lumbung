import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
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

    if (!session?.user) {
        redirect('/login');
    }

    return (
        <div className="w-full space-y-6">
            <CategoriesListSection
                page={page}
                pageSize={pageSize}
                search={search}
            />
        </div>
    );
}

