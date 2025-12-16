'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { generateOrderNumber } from '@/lib/utils';
import { purchaseOrderService } from '@/lib/services/purchaseOrderService';
import { purchaseOrderSchema } from '@/lib/validations/purchase-order';

export async function createPurchaseOrder(formData: FormData) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const rawData = {
        supplierId: formData.get('supplierId') as string,
        warehouseId: formData.get('warehouseId') as string,
        notes: formData.get('notes') as string,
        items: JSON.parse(formData.get('items') as string || '[]'),
    };

    const validatedFields = purchaseOrderSchema.safeParse(rawData);

    if (!validatedFields.success) {
        throw new Error(validatedFields.error.issues[0].message);
    }

    const { supplierId, warehouseId, notes, items } = validatedFields.data;

    const order = await purchaseOrderService.createPurchaseOrderDraft({
        organizationId: session.user.organizationId!,
        supplierId,
        warehouseId,
        items,
        notes,
        createdById: session.user.id,
    });

    revalidatePath('/purchase-orders');
    return order;
}

export async function receivePurchaseOrder(orderId: string) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    // Fetch order to get items for "Receive All"
    const order = await prisma.purchaseOrder.findUnique({
        where: { id: orderId },
        include: { items: true },
    });

    if (!order) throw new Error('Order not found');

    const receivedItems = order.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity - item.receivedQty, // Receive remaining quantity
    })).filter(item => item.quantity > 0);

    if (receivedItems.length === 0) {
        throw new Error('All items already received');
    }

    await purchaseOrderService.createPurchaseReceipt({
        purchaseOrderId: orderId,
        organizationId: session.user.organizationId!,
        receivedItems,
        notes: 'Full receipt via action',
        userId: session.user.id,
    });

    revalidatePath('/purchase-orders');
    revalidatePath(`/purchase-orders/${orderId}`);
}

export async function updatePurchaseOrderStatus(orderId: string, status: string) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    await prisma.purchaseOrder.update({
        where: { id: orderId },
        data: { status: status as any },
    });

    revalidatePath('/purchase-orders');
    revalidatePath(`/purchase-orders/${orderId}`);
}
