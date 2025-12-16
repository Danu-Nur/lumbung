import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { InvoiceContent } from './invoice-content';

async function getSalesOrder(orderId: string, organizationId: string) {
    return await prisma.salesOrder.findFirst({
        where: {
            id: orderId,
            organizationId,
        },
        include: {
            customer: true,
            warehouse: true,
            items: {
                include: {
                    product: true,
                },
            },
            organization: true,
        },
    });
}

export default async function InvoicePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || !session.user.organizationId) {
        redirect('/login');
    }

    const order = await getSalesOrder(id, session.user.organizationId);

    if (!order || !order.customer || !order.organization || !order.warehouse) {
        notFound();
    }

    return <InvoiceContent order={order as any} />;
}
