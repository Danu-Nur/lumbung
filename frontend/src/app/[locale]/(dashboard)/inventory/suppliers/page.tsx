import { cookies } from 'next/headers';
import { SupplierListSection } from '@/components/domain/suppliers/sections/supplier-list-section';
import { getTranslations } from 'next-intl/server';

export default async function SuppliersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; pageSize?: string; q?: string }>;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    let orgId = '';

    if (token) {
        try {
            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            orgId = payload.organizationId || '';
        } catch (e) {
            console.error("Token parse error", e);
        }
    }

    if (!orgId && token === 'offline-dev-token') {
        orgId = 'org-offline';
    }

    const resolvedSearchParams = await searchParams;
    const page = Number(resolvedSearchParams.page) || 1;
    const pageSize = Number(resolvedSearchParams.pageSize) || 10;
    const search = resolvedSearchParams.q || '';

    return (
        <div className="w-full space-y-6">
            <h1 className="text-2xl font-bold">Suppliers</h1>
            <div className="min-h-[500px]">
                <SupplierListSection
                    page={page}
                    pageSize={pageSize}
                    search={search}
                    organizationId={orgId}
                />
            </div>
        </div>
    );
}
