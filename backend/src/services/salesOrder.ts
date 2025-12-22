import { prisma } from '../lib/prisma.js';
import { SalesOrderStatus, MovementType } from '@prisma/client';
import { outboxService } from './outbox.js';

export class SalesOrderService {
    static async getOrders(organizationId: string, params: { page?: number; pageSize?: number; q?: string } = {}) {
        const { page = 1, pageSize = 10, q = '' } = params;
        const skip = (page - 1) * pageSize;

        const where: any = { organizationId };

        if (q) {
            where.OR = [
                { orderNumber: { contains: q, mode: 'insensitive' } },
                { customer: { name: { contains: q, mode: 'insensitive' } } }
            ];
        }

        const [orders, total] = await Promise.all([
            prisma.salesOrder.findMany({
                where,
                include: {
                    customer: true,
                    warehouse: true,
                    items: {
                        include: { product: true }
                    }
                },
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.salesOrder.count({ where })
        ]);

        return { orders, total };
    }

    static async createOrder(data: any, organizationId: string, userId: string) {
        return await prisma.$transaction(async (tx) => {
            const { customerId, warehouseId, items, notes, orderNumber } = data;

            // Calculate totals
            let subtotal = 0;
            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product) throw new Error(`Product ${item.productId} not found`);
                subtotal += Number(product.sellingPrice) * item.quantity;
            }

            const order = await tx.salesOrder.create({
                data: {
                    organizationId,
                    orderNumber: orderNumber || `SO-${Date.now()}`,
                    customerId,
                    warehouseId,
                    status: SalesOrderStatus.DRAFT,
                    notes,
                    subtotal,
                    tax: 0,
                    discount: 0,
                    total: subtotal,
                    createdById: userId,
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            lineTotal: item.quantity * item.unitPrice
                        }))
                    }
                },
                include: { items: true }
            });

            return order;
        });
    }

    static async confirmOrder(orderId: string, organizationId: string) {
        return await prisma.$transaction(async (tx) => {
            const order = await tx.salesOrder.findFirst({
                where: { id: orderId, organizationId },
                include: { items: true }
            });

            if (!order) throw new Error('Order not found');
            if (order.status !== SalesOrderStatus.DRAFT) throw new Error('Only draft orders can be confirmed');

            // Optional: Allocate stock here if needed

            return await tx.salesOrder.update({
                where: { id: orderId },
                data: { status: SalesOrderStatus.CONFIRMED }
            });
        });
    }

    static async fulfillOrder(orderId: string, organizationId: string, userId: string) {
        return await prisma.$transaction(async (tx) => {
            const order = await tx.salesOrder.findFirst({
                where: { id: orderId, organizationId },
                include: { items: true }
            });

            if (!order) throw new Error('Order not found');
            if (order.status !== SalesOrderStatus.CONFIRMED) throw new Error('Order must be confirmed before fulfillment');

            const updatedOrder = await tx.salesOrder.update({
                where: { id: orderId },
                data: { status: SalesOrderStatus.FULFILLED }
            });

            // Create Stock Movements using FIFO (First-In-First-Out) logic
            for (const item of order.items) {
                let remainingToFulfill = item.quantity;

                // 1. Get all available batches for this product in this warehouse (FIFO)
                const batches = await tx.inventoryItem.findMany({
                    where: {
                        productId: item.productId,
                        warehouseId: order.warehouseId,
                        availableQty: { gt: 0 }
                    },
                    orderBy: {
                        receivedDate: 'asc'
                    }
                });

                const totalAvailable = batches.reduce((acc, b) => acc + b.availableQty, 0);
                if (totalAvailable < remainingToFulfill) {
                    const product = await tx.product.findUnique({ where: { id: item.productId } });
                    throw new Error(`Insufficient stock for product ${product?.name || item.productId}. Required: ${remainingToFulfill}, Available: ${totalAvailable}`);
                }

                // 2. Deduct from batches sequentially
                for (const batch of batches) {
                    if (remainingToFulfill <= 0) break;

                    const takeFromThisBatch = Math.min(batch.availableQty, remainingToFulfill);

                    await tx.inventoryItem.update({
                        where: { id: batch.id },
                        data: {
                            quantityOnHand: { decrement: takeFromThisBatch },
                            availableQty: { decrement: takeFromThisBatch }
                        }
                    });

                    // 3. Record movement linked to the specific batch
                    await tx.inventoryMovement.create({
                        data: {
                            productId: item.productId,
                            warehouseId: order.warehouseId,
                            inventoryItemId: batch.id,
                            movementType: MovementType.OUT,
                            quantity: -takeFromThisBatch, // Negative for OUT
                            referenceType: 'SalesOrder',
                            referenceId: order.id,
                            createdById: userId,
                            notes: `Fulfillment of ${order.orderNumber} from Batch: ${batch.batchNumber || batch.id}`
                        }
                    });

                    remainingToFulfill -= takeFromThisBatch;
                }

                // 4. Trigger Aggregate Stock Summary update
                await outboxService.createEvent({
                    organizationId,
                    topic: 'inventory.movement.created',
                    payload: { productId: item.productId, warehouseId: order.warehouseId }
                }, tx);
            }

            return updatedOrder;
        });
    }
}
