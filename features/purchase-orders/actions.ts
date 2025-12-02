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

    if (!supplierId || !warehouseId || !itemsJson) {
        throw new Error('Missing required fields');
    }

    const items = JSON.parse(itemsJson) as Array<{
        productId: string;
        quantity: number;
        unitCost: number;
    }>;

    if (items.length === 0) {
        throw new Error('Order must have at least one item');
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const total = subtotal; // Assuming no tax/discount for now as per schema defaults

    // Create order in transaction
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

        // Create line items
        for (const item of items) {
            const lineTotal = item.quantity * item.unitCost;
            await tx.purchaseOrderItem.create({
                data: {
                    purchaseOrderId: purchaseOrder.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitCost: item.unitCost,
                    lineTotal,
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
        const order = await tx.purchaseOrder.findUnique({
            where: { id: orderId },
            include: { items: true },
        });

        if (!order) throw new Error('Order not found');

        // Update inventory for each item
        for (const item of order.items) {
            // Create IN movement
            await tx.inventoryMovement.create({
                data: {
                    productId: item.productId,
                    warehouseId: order.warehouseId,
                    movementType: 'IN',
                    quantity: item.quantity,
                    referenceType: 'PurchaseOrder',
                    referenceId: order.id,
                    notes: `Purchase Order ${order.poNumber}`,
                    createdById: session.user.id,
                },
            });

            // Update inventory item
            const inventoryItem = await tx.inventoryItem.findUnique({
                where: {
                    productId_warehouseId: {
                        productId: item.productId,
                        warehouseId: order.warehouseId,
                    },
                },
            });

            if (inventoryItem) {
                await tx.inventoryItem.update({
                    where: { id: inventoryItem.id },
                    data: {
                        quantityOnHand: { increment: item.quantity },
                        availableQty: { increment: item.quantity },
                    },
                });
            } else {
                // Create new inventory item if it doesn't exist
                await tx.inventoryItem.create({
                    data: {
                        productId: item.productId,
                        warehouseId: order.warehouseId,
                        quantityOnHand: item.quantity,
                        availableQty: item.quantity,
                    },
                });
            }

            // Update received quantity on line item
            await tx.purchaseOrderItem.update({
                where: { id: item.id },
                data: { receivedQty: item.quantity },
            });
        }

        // Update order status
        await tx.purchaseOrder.update({
            where: { id: orderId },
            data: { status: 'COMPLETED' },
        });
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
