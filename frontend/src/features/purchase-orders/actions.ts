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
        supplierId: (formData.get('supplierId') as string) || "",
        warehouseId: (formData.get('warehouseId') as string) || "",
        notes: (formData.get('notes') as string) || "",
        items: JSON.parse(formData.get('items') as string || '[]'),
    };

    const validatedFields = purchaseOrderSchema.safeParse(rawData);

    if (!validatedFields.success) {
        throw new Error(validatedFields.error.issues[0].message);
    }

    const { supplierId, warehouseId, notes, items } = validatedFields.data;

    const order = await purchaseOrderService.createPurchaseOrder({
        organizationId: session.user.organizationId!,
        supplierId,
        warehouseId,
        items,
        notes,
        createdById: session.user.id,
    }, (session.user as any).accessToken);

    revalidatePath('/purchase-orders');
    return order;
}

export async function receivePurchaseOrder(orderId: string) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    // Call backend to complete the order (creates batches, adds stock, updates status)
    await purchaseOrderService.completeOrder(
        orderId,
        (session.user as any).accessToken
    );

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
