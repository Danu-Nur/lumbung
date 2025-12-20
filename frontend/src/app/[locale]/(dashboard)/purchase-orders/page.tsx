import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { PurchaseOrderListSection } from '@/components/domain/purchase-orders/sections/purchase-order-list-section';
import { getQueryClient } from '@/lib/query';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { purchaseOrderService } from '@/lib/services/purchaseOrderService';

export default async function PurchaseOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await auth();
    const t = await getTranslations('purchases');
    const tCommon = await getTranslations('common');

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const orgId = session.user.organizationId;
    const token = (session.user as any).accessToken;
    const params = await searchParams;
    const page = Number(params?.page) || 1;
    const pageSize = Number(params?.pageSize) || 10;
    const query = params?.q?.toString() || '';

    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: ['purchase-orders', page, pageSize, query],
        queryFn: () => purchaseOrderService.listPurchaseOrders({
            organizationId: orgId,
            page,
            pageSize,
            search: query,
            token
        }),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="space-y-6">
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
                            </div>
                        )
                    }}
                    actions={
                        <div className="flex items-center gap-2">
                            <Link href="?modal=create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {tCommon('buttons.add')}
                                </Button>
                            </Link>
                        </div>
                    }
                />

                <PurchaseOrderListSection
                    page={page}
                    pageSize={pageSize}
                    search={query}
                    organizationId={orgId}
                    accessToken={token}
                />
            </div>
        </HydrationBoundary>
    );
}
