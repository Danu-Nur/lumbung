'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { generateOrderNumber } from '@/lib/utils';
import { salesOrderService } from '@/lib/services/salesOrderService';
import { salesOrderSchema } from '@/lib/validations/sales-order';

export async function createSalesOrder(formData: FormData) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const rawData = {
        customerId: formData.get('customerId') as string,
        warehouseId: formData.get('warehouseId') as string,
        notes: formData.get('notes') as string,
        items: JSON.parse(formData.get('items') as string || '[]'),
    };

    const validatedFields = salesOrderSchema.safeParse(rawData);

    if (!validatedFields.success) {
        throw new Error(validatedFields.error.issues[0].message);
    }

    const { customerId, warehouseId, notes, items } = validatedFields.data;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalDiscount = items.reduce((sum: number, item) => sum + item.discount, 0);
    const total = subtotal - totalDiscount;

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
        const orderNumber = generateOrderNumber('SO');

        const salesOrder = await tx.salesOrder.create({
            data: {
                orderNumber,
                customerId: customerId || null,
                warehouseId,
                status: 'DRAFT',
                notes: notes || null,
                subtotal,
                tax: 0,
                discount: totalDiscount,
                total,
                organizationId: session.user.organizationId!,
                createdById: session.user.id,
            },
        });

        // Create line items with price snapshots
        for (const item of items) {
            const lineTotal = (item.quantity * item.unitPrice) - item.discount;
            await tx.salesOrderItem.create({
                data: {
                    salesOrderId: salesOrder.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice, // Price snapshot
                    discount: item.discount,
                    lineTotal,
                },
            });
        }

        return salesOrder;
    });

    revalidatePath('/sales-orders');
    return order;
}



export async function fulfillSalesOrder(orderId: string) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    await salesOrderService.fulfillSalesOrder(orderId, session.user.organizationId, session.user.id);

    revalidatePath('/sales-orders');
    revalidatePath(`/sales-orders/${orderId}`);
}

export async function updateOrderStatus(orderId: string, status: string) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    await prisma.salesOrder.update({
        where: { id: orderId },
        data: { status: status as any },
    });

    revalidatePath('/sales-orders');
    revalidatePath(`/sales-orders/${orderId}`);
}

export async function confirmSalesOrder(orderId: string) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    await salesOrderService.confirmSalesOrder(orderId, session.user.organizationId);

    revalidatePath('/sales-orders');
    revalidatePath(`/sales-orders/${orderId}`);
}

export async function cancelSalesOrder(orderId: string) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    await salesOrderService.cancelSalesOrder(orderId, session.user.organizationId);

    revalidatePath('/sales-orders');
    revalidatePath(`/sales-orders/${orderId}`);
}
