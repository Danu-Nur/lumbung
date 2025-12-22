import { prisma } from '../lib/prisma.js';
import { PurchaseOrderStatus, MovementType } from '@prisma/client';
import { outboxService } from './outbox.js';
import { cache } from '../lib/cache.js';

export class PurchaseOrderService {
    static async getOrders(organizationId: string, params: { page?: number; pageSize?: number; q?: string } = {}) {
        const { page = 1, pageSize = 10, q = '' } = params;
        const skip = (page - 1) * pageSize;

        const where: any = { organizationId };

        if (q) {
            where.OR = [
                { poNumber: { contains: q, mode: 'insensitive' } },
                { supplier: { name: { contains: q, mode: 'insensitive' } } }
            ];
        }

        const [orders, total] = await Promise.all([
            prisma.purchaseOrder.findMany({
                where,
                include: {
                    supplier: true,
                    warehouse: true,
                    items: {
                        include: { product: true }
                    }
                },
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.purchaseOrder.count({ where })
        ]);

        return { orders, total };
    }

    static async createOrder(data: any, organizationId: string, userId: string) {
        return await prisma.$transaction(async (tx) => {
            const { supplierId, warehouseId, items, notes, poNumber } = data;

            let subtotal = 0;
            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product) throw new Error(`Product ${item.productId} not found`);
                subtotal += Number(item.unitCost) * item.quantity;
            }

            const order = await tx.purchaseOrder.create({
                data: {
                    organizationId,
                    poNumber: poNumber || `PO-${Date.now()}`,
                    supplierId,
                    warehouseId,
                    status: PurchaseOrderStatus.DRAFT,
                    notes,
                    subtotal,
                    tax: 0,
                    total: subtotal,
                    createdById: userId,
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitCost: item.unitCost,
                            lineTotal: item.quantity * item.unitCost
                        }))
                    }
                },
                include: { items: true }
            });

            return order;
        });
    }

    static async completeOrder(orderId: string, organizationId: string, userId: string) {
        return await prisma.$transaction(async (tx) => {
            const order = await tx.purchaseOrder.findFirst({
                where: { id: orderId, organizationId },
                include: { items: true }
            });

            if (!order) throw new Error('Order not found');
            if (order.status === PurchaseOrderStatus.COMPLETED) throw new Error('Order already completed');

            const updatedOrder = await tx.purchaseOrder.update({
                where: { id: orderId },
                data: { status: PurchaseOrderStatus.COMPLETED }
            });

            // Create Inventory Movements (IN) and Create New Inventory Batch
            for (const item of order.items) {
                // 1. Update Product's Cost Price as Last Reference and record history
                await tx.product.update({
                    where: { id: item.productId },
                    data: { costPrice: item.unitCost }
                });

                await tx.productPriceHistory.create({
                    data: {
                        productId: item.productId,
                        priceType: 'COST',
                        price: item.unitCost,
                        notes: `Updated from PO ${order.poNumber} (New Batch Received)`,
                        createdById: userId
                    }
                });

                // 2. Create New Inventory Batch (Strict Batch Tracking)
                const inventoryItem = await tx.inventoryItem.create({
                    data: {
                        productId: item.productId,
                        warehouseId: order.warehouseId,
                        supplierId: order.supplierId,
                        unitCost: item.unitCost,
                        quantityOnHand: item.quantity,
                        availableQty: item.quantity,
                        batchNumber: order.poNumber,
                        receivedDate: new Date()
                    }
                });

                // 3. Record the stock movement linked to the batch
                await tx.inventoryMovement.create({
                    data: {
                        productId: item.productId,
                        warehouseId: order.warehouseId,
                        inventoryItemId: inventoryItem.id,
                        movementType: MovementType.IN,
                        quantity: item.quantity,
                        referenceType: 'PurchaseOrder',
                        referenceId: order.id,
                        createdById: userId,
                        notes: `Receipt of ${order.poNumber} (Batch ID: ${inventoryItem.id})`
                    }
                });

                // 4. Trigger Stock Recalculation (Aggregate to StockSummary)
                await outboxService.createEvent({
                    organizationId,
                    topic: 'inventory.movement.created',
                    payload: {
                        productId: item.productId,
                        warehouseId: order.warehouseId,
                        inventoryItemId: inventoryItem.id
                    }
                }, tx);
            }

            const finalOrder = await tx.purchaseOrder.findUnique({
                where: { id: updatedOrder.id },
                include: { items: true }
            });

            // Invalidate cache
            await cache.invalidatePattern(`tenant:${organizationId}:products:*`);
            await cache.invalidate(`tenant:${organizationId}:inventory:stats`);

            return finalOrder;
        });
    }
}
