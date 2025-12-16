import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { SalesHeader } from '@/components/domain/sales-orders/sales-header';
import { SalesOrderListSection } from '@/components/domain/sales-orders/sections/sales-order-list-section';
import { CustomerListSection } from '@/components/domain/customers/sections/customer-list-section';

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

    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const pageSize = Number(params?.pageSize) || 10;
    const query = params?.q?.toString() || '';
    const view = params?.view?.toString() || 'orders';

    return (
        <div className="space-y-6">
            <SalesHeader />

            <div className="min-h-[500px]">
                {view === 'orders' && (
                    <SalesOrderListSection
                        page={page}
                        pageSize={pageSize}
                        search={query}
                    />
                )}
                {view === 'customers' && (
                    <CustomerListSection
                        page={page}
                        pageSize={pageSize}
                        search={query}
                    />
                )}
            </div>
        </div>
    );
}
