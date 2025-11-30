'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { generateOrderNumber } from '@/lib/utils';

export async function createPurchaseOrder(formData: FormData) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const supplierId = formData.get('supplierId') as string;
    const warehouseId = formData.get('warehouseId') as string;
    const notes = formData.get('notes') as string;
    const itemsJson = formData.get('items') as string;

    const items = JSON.parse(itemsJson) as Array<{
        productId: string;
        quantity: number;
        unitCost: number;
    }>;

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const total = subtotal;

    const order = await prisma.$transaction(async (tx) => {
        const poNumber = generateOrderNumber('PO');

        const purchaseOrder = await tx.purchaseOrder.create({
            data: {
                poNumber,
                supplierId,
                warehouseId,
                status: 'DRAFT',
                notes: notes || null,
                subtotal,
                tax: 0,
                total,
                organizationId: session.user.organizationId!,
                createdById: session.user.id,
            },
        });

        for (const item of items) {
            await tx.purchaseOrderItem.create({
                data: {
                    purchaseOrderId: purchaseOrder.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitCost: item.unitCost, // Cost snapshot
                    lineTotal: item.quantity * item.unitCost,
                    receivedQty: 0,
                },
            });
        }

        return purchaseOrder;
    });

    revalidatePath('/purchase-orders');
    redirect('/purchase-orders');
}

export async function receivePurchaseOrder(orderId: string) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    await prisma.$transaction(async (tx) => {
        const order = await tx.purchaseOrder.findFirst({
            where: {
                id: orderId,
                organizationId: session.user.organizationId!,
            },
            include: {
                items: true,
            },
        });

        if (!order || order.status !== 'SENT') {
            throw new Error('Invalid order status');
        }

        // Create movements and update stock
        for (const item of order.items) {
            await tx.inventoryMovement.create({
                data: {
                    productId: item.productId,
                    warehouseId: order.warehouseId,
                    movementType: 'IN',
                    quantity: item.quantity,
                    referenceType: 'PurchaseOrder',
                    referenceId: order.id,
                    notes: `PO ${order.poNumber}`,
                    createdById: session.user.id,
                },
            });

            const inventoryItem = await tx.inventoryItem.findUnique({
                where: {
                    productId_warehouseId: {
                        productId: item.productId,
                        warehouseId: order.warehouseId,
                    },
                },
            });

            if (inventoryItem) {
                const newQuantity = inventoryItem.quantityOnHand + item.quantity;
                await tx.inventoryItem.update({
                    where: { id: inventoryItem.id },
                    data: {
                        quantityOnHand: newQuantity,
                        availableQty: newQuantity - inventoryItem.allocatedQty,
                    },
                });
            } else {
                await tx.inventoryItem.create({
                    data: {
                        productId: item.productId,
                        warehouseId: order.warehouseId,
                        quantityOnHand: item.quantity,
                        allocatedQty: 0,
                        availableQty: item.quantity,
                    },
                });
            }

            await tx.purchaseOrderItem.update({
                where: { id: item.id },
                data: { receivedQty: item.quantity },
            });
        }

        await tx.purchaseOrder.update({
            where: { id: orderId },
            data: { status: 'COMPLETED' },
        });
    });

    revalidatePath('/purchase-orders');
    revalidatePath(`/purchase-orders/${orderId}`);
}
