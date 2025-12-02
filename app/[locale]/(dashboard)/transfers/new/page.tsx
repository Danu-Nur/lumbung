import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { NewTransferForm } from './new-transfer-form';
import { PageHeader } from '@/components/shared/page-header';

export default async function NewTransferPage() {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const [warehouses, products] = await Promise.all([
        prisma.warehouse.findMany({
            where: {
                organizationId: session.user.organizationId,
                deletedAt: null,
                isActive: true,
            },
            select: { id: true, name: true },
        }),
        prisma.product.findMany({
            where: { organizationId: session.user.organizationId },
            select: { id: true, name: true, sku: true },
        }),
    ]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="New Transfer"
                description="Create a new stock transfer"
            />
            <NewTransferForm
                warehouses={warehouses}
                products={products}
            />
        </div>
    );
}
