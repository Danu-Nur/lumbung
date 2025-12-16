import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { NewPurchaseOrderForm } from './new-purchase-order-form';
import { PageHeader } from '@/components/shared/page-header';

export default async function NewPurchaseOrderPage() {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const [suppliers, warehouses, products] = await Promise.all([
        prisma.supplier.findMany({
            where: { organizationId: session.user.organizationId },
            select: { id: true, name: true },
        }),
        prisma.warehouse.findMany({
            where: { organizationId: session.user.organizationId },
            select: { id: true, name: true },
        }),
        prisma.product.findMany({
            where: { organizationId: session.user.organizationId },
            select: { id: true, name: true, sku: true, costPrice: true },
        }),
    ]);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Create Purchase Order"
                description="Create a new order for a supplier"
            />
            <NewPurchaseOrderForm
                suppliers={suppliers}
                warehouses={warehouses}
                products={products.map((p: any) => ({
                    ...p,
                    costPrice: Number(p.costPrice)
                }))}
            />
        </div>
    );
}
