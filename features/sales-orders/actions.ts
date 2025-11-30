'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { generateOrderNumber } from '@/lib/utils';

export async function createSalesOrder(formData: FormData) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const customerId = formData.get('customerId') as string;
    const warehouseId = formData.get('warehouseId') as string;
    const notes = formData.get('notes') as string;
    const itemsJson = formData.get('items') as string;

    if (!customerId || !warehouseId || !itemsJson) {
        throw new Error('Missing required fields');
    }

    const items = JSON.parse(itemsJson) as Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
        discount: number;
    }>;

    if (items.length === 0) {
        throw new Error('Order must have at least one item');
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
    const total = subtotal - totalDiscount;

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
        const orderNumber = generateOrderNumber('SO');

        const salesOrder = await tx.salesOrder.create({
            data: {
                orderNumber,
                customerId,
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
    redirect('/sales-orders');
}

export async function fulfillSalesOrder(orderId: string) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    await prisma.$transaction(async (tx) => {
        // Get order with items
        const order = await tx.salesOrder.findFirst({
            where: {
                id: orderId,
                organizationId: session.user.organizationId!,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            throw new Error('Order not found');
        }

        if (order.status !== 'CONFIRMED') {
            throw new Error('Only confirmed orders can be fulfilled');
        }

        // Create inventory movements and update stock
        for (const item of order.items) {
            // Create OUT movement
            await tx.inventoryMovement.create({
                data: {
                    productId: item.productId,
                    warehouseId: order.warehouseId,
                    movementType: 'OUT',
                    quantity: -item.quantity,
                    referenceType: 'SalesOrder',
                    referenceId: order.id,
                    notes: `Sales Order ${order.orderNumber}`,
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
                const newQuantity = inventoryItem.quantityOnHand - item.quantity;
                await tx.inventoryItem.update({
                    where: { id: inventoryItem.id },
                    data: {
                        quantityOnHand: newQuantity,
                        availableQty: newQuantity - inventoryItem.allocatedQty,
                    },
                });
            }
        }

        // Update order status
        await tx.salesOrder.update({
            where: { id: orderId },
            data: { status: 'FULFILLED' },
        });
    });

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
