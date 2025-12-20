import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { SalesHeader } from '@/components/domain/sales-orders/sales-header';
import { SalesOrderListSection } from '@/components/domain/sales-orders/sections/sales-order-list-section';
import { CustomerListSection } from '@/components/domain/customers/sections/customer-list-section';
import { getQueryClient } from '@/lib/query';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { salesOrderService } from '@/lib/services/salesOrderService';

export default async function SalesOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await auth();
    const t = await getTranslations('sales');

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const orgId = session.user.organizationId;
    const token = (session.user as any).accessToken;
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const pageSize = Number(params?.pageSize) || 10;
    const query = params?.q?.toString() || '';
    const view = params?.view?.toString() || 'orders';

    const queryClient = getQueryClient();

    // Prefetch based on view
    if (view === 'orders') {
        await queryClient.prefetchQuery({
            queryKey: ['sales-orders', page, pageSize, query],
            queryFn: () => salesOrderService.listSalesOrders({
                organizationId: orgId,
                page,
                pageSize,
                search: query,
                token
            }),
        });
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="space-y-6">
                <SalesHeader />

                <div className="min-h-[500px]">
                    {view === 'orders' && (
                        <SalesOrderListSection
                            page={page}
                            pageSize={pageSize}
                            search={query}
                            organizationId={orgId}
                            accessToken={token}
                        />
                    )}
                    {view === 'customers' && (
                        <CustomerListSection
                            page={page}
                            pageSize={pageSize}
                            search={query}
                            organizationId={orgId}
                            accessToken={token}
                        />
                    )}
                </div>
            </div>
        </HydrationBoundary>
    );
}
