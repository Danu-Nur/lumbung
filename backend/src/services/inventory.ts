import { prisma } from '../lib/prisma.js';
import { AdjustmentReason } from '@prisma/client';
import { cache } from '../lib/cache.js';

export interface CreateStockAdjustmentData {
    productId: string;
    warehouseId: string;
    type: 'increase' | 'decrease';
    quantity: number;
    reason: string;
    notes?: string | null;
    organizationId: string;
    userId: string;
}

export class InventoryService {
    static async createStockAdjustment(data: CreateStockAdjustmentData) {
        const { productId, warehouseId, type, quantity, reason, notes, organizationId, userId } = data;

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Stock Adjustment record
            const adjustment = await tx.stockAdjustment.create({
                data: {
                    productId,
                    warehouseId,
                    adjustmentType: type,
                    quantity,
                    reason: reason as AdjustmentReason,
                    notes,
                    organizationId,
                    createdById: userId,
                }
            });

            // 2. Create Inventory Movement
            await tx.inventoryMovement.create({
                data: {
                    productId,
                    warehouseId,
                    movementType: 'ADJUST',
                    quantity: type === 'increase' ? quantity : -quantity,
                    referenceType: 'StockAdjustment',
                    referenceId: adjustment.id,
                    notes: notes || reason,
                    createdById: userId,
                }
            });

            const diff = type === 'increase' ? quantity : -quantity;

            if (type === 'increase') {
                // For increase, we create a new batch/entry
                const product = await tx.product.findUnique({ where: { id: productId } });
                const inventoryItem = await tx.inventoryItem.create({
                    data: {
                        productId,
                        warehouseId,
                        unitCost: product?.costPrice || 0,
                        quantityOnHand: quantity,
                        availableQty: quantity,
                        batchNumber: `ADJ-${Date.now()}`,
                        receivedDate: new Date()
                    }
                });

                // Update movement with linked item
                await tx.inventoryMovement.update({
                    where: { id: (await tx.inventoryMovement.findFirst({ where: { referenceId: adjustment.id, referenceType: 'StockAdjustment' } }))?.id || '' },
                    data: { inventoryItemId: inventoryItem.id }
                });
            } else {
                // For decrease, we use FIFO to deduct from existing batches
                let remainingToDeduct = quantity;
                const batches = await tx.inventoryItem.findMany({
                    where: { productId, warehouseId, availableQty: { gt: 0 } },
                    orderBy: { receivedDate: 'asc' }
                });

                for (const batch of batches) {
                    if (remainingToDeduct <= 0) break;
                    const take = Math.min(batch.availableQty, remainingToDeduct);

                    await tx.inventoryItem.update({
                        where: { id: batch.id },
                        data: {
                            quantityOnHand: { decrement: take },
                            availableQty: { decrement: take }
                        }
                    });

                    // Update existing movement or create sub-movements? 
                    // To keep it simple, we'll link the main movement to the first batch or create a more complex structure.
                    // For now, let's just link it to the first batch and we might need to improve this for multi-batch adjustments.
                    if (remainingToDeduct === quantity) {
                        await tx.inventoryMovement.update({
                            where: { id: (await tx.inventoryMovement.findFirst({ where: { referenceId: adjustment.id, referenceType: 'StockAdjustment' } }))?.id || '' },
                            data: { inventoryItemId: batch.id }
                        });
                    }

                    remainingToDeduct -= take;
                }

                if (remainingToDeduct > 0) {
                    throw new Error('Insufficient stock across all batches');
                }
            }

            // 4. Create Outbox Event for Async Recalculation & Caching
            await tx.outboxEvent.create({
                data: {
                    organizationId,
                    topic: 'inventory.movement.created',
                    payload: {
                        productId,
                        warehouseId,
                        organizationId,
                        movementId: adjustment.id,
                        type: 'adjustment'
                    }
                }
            });

            return adjustment;
        });

        // Invalidate cache immediately for better UX
        await cache.invalidate(`tenant:${organizationId}:product:${productId}`);
        await cache.invalidatePattern(`tenant:${organizationId}:products:*`);
        await cache.invalidate(`tenant:${organizationId}:inventory:stats`);

        return result;
    }

    static async getInventory(organizationId: string, params: { page?: number; pageSize?: number; q?: string } = {}) {
        const { page = 1, pageSize = 10, q = '' } = params;
        const skip = (page - 1) * pageSize;

        const where: any = {
            organizationId,
            deletedAt: null
        };

        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { sku: { contains: q, mode: 'insensitive' } }
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    inventoryItems: {
                        include: { warehouse: true, supplier: true },
                        orderBy: { receivedDate: 'asc' }
                    }
                },
                skip,
                take: pageSize,
                orderBy: { name: 'asc' }
            }),
            prisma.product.count({ where })
        ]);

        return { products, total };
    }

    static async getAdjustments(organizationId: string, params: { page?: number; pageSize?: number; q?: string } = {}) {
        const { page = 1, pageSize = 10, q = '' } = params;
        const skip = (page - 1) * pageSize;

        const where: any = { organizationId };

        if (q) {
            where.OR = [
                { product: { name: { contains: q, mode: 'insensitive' } } },
                { reason: { contains: q, mode: 'insensitive' } }
            ];
        }

        const [adjustments, total] = await Promise.all([
            prisma.stockAdjustment.findMany({
                where,
                include: {
                    product: true,
                    warehouse: true,
                    createdBy: true
                },
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.stockAdjustment.count({ where })
        ]);

        return { adjustments, total };
    }

    static async getTransfers(organizationId: string, params: { page?: number; pageSize?: number; q?: string } = {}) {
        const { page = 1, pageSize = 10, q = '' } = params;
        const skip = (page - 1) * pageSize;

        const where: any = { organizationId };

        if (q) {
            where.OR = [
                { transferNumber: { contains: q, mode: 'insensitive' } },
                { fromWarehouse: { name: { contains: q, mode: 'insensitive' } } },
                { toWarehouse: { name: { contains: q, mode: 'insensitive' } } }
            ];
        }

        const [transfers, total] = await Promise.all([
            prisma.stockTransfer.findMany({
                where,
                include: {
                    fromWarehouse: true,
                    toWarehouse: true,
                    items: {
                        include: { product: true }
                    }
                },
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.stockTransfer.count({ where })
        ]);

        return { transfers, total };
    }

    static async getOpnames(organizationId: string, params: { page?: number; pageSize?: number; q?: string } = {}) {
        const { page = 1, pageSize = 10, q = '' } = params;
        const skip = (page - 1) * pageSize;

        const where: any = { organizationId };

        if (q) {
            where.opnameNumber = { contains: q, mode: 'insensitive' };
        }

        const [opnames, total] = await Promise.all([
            prisma.stockOpname.findMany({
                where,
                include: {
                    warehouse: true,
                    createdBy: true,
                    items: {
                        include: { product: true }
                    }
                },
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.stockOpname.count({ where })
        ]);

        return { opnames, total };
    }

    static async createTransfer(data: {
        fromWarehouseId: string;
        toWarehouseId: string;
        notes?: string | null;
        items: Array<{ productId: string; quantity: number }>;
        organizationId: string;
        userId: string;
    }) {
        const { fromWarehouseId, toWarehouseId, notes, items, organizationId, userId } = data;

        const result = await prisma.$transaction(async (tx) => {
            const transferNumber = `TRF-${Date.now()}`;
            // 1. Create Transfer record
            const transfer = await tx.stockTransfer.create({
                data: {
                    transferNumber,
                    fromWarehouseId,
                    toWarehouseId,
                    notes,
                    organizationId,
                    createdById: userId,
                    status: 'COMPLETED',
                    items: {
                        create: items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                        }))
                    }
                },
                include: { items: true }
            });

            // 2. Create Movements and Update Inventory for each item (FIFO)
            for (const item of items) {
                let remainingToTransfer = item.quantity;

                // Get source batches (FIFO)
                const sourceBatches = await tx.inventoryItem.findMany({
                    where: { productId: item.productId, warehouseId: fromWarehouseId, availableQty: { gt: 0 } },
                    orderBy: { receivedDate: 'asc' }
                });

                for (const batch of sourceBatches) {
                    if (remainingToTransfer <= 0) break;
                    const take = Math.min(batch.availableQty, remainingToTransfer);

                    // Deduct from source batch
                    await tx.inventoryItem.update({
                        where: { id: batch.id },
                        data: {
                            quantityOnHand: { decrement: take },
                            availableQty: { decrement: take }
                        }
                    });

                    // Create new batch in destination (Preserve Price!)
                    const destBatch = await tx.inventoryItem.create({
                        data: {
                            productId: item.productId,
                            warehouseId: toWarehouseId,
                            unitCost: batch.unitCost, // PRESERVE ORIGINAL COST
                            supplierId: batch.supplierId,
                            quantityOnHand: take,
                            availableQty: take,
                            batchNumber: batch.batchNumber,
                            receivedDate: batch.receivedDate // Keep original receipt date for FIFO chain?
                        }
                    });

                    // Create Movements
                    await tx.inventoryMovement.create({
                        data: {
                            productId: item.productId,
                            warehouseId: fromWarehouseId,
                            inventoryItemId: batch.id,
                            movementType: 'TRANSFER_OUT',
                            quantity: -take,
                            referenceType: 'StockTransfer',
                            referenceId: transfer.id,
                            notes: `Transfer to ${toWarehouseId}`,
                            createdById: userId,
                        }
                    });

                    await tx.inventoryMovement.create({
                        data: {
                            productId: item.productId,
                            warehouseId: toWarehouseId,
                            inventoryItemId: destBatch.id,
                            movementType: 'TRANSFER_IN',
                            quantity: take,
                            referenceType: 'StockTransfer',
                            referenceId: transfer.id,
                            notes: `Transfer from ${fromWarehouseId}`,
                            createdById: userId,
                        }
                    });

                    remainingToTransfer -= take;
                }

                if (remainingToTransfer > 0) {
                    throw new Error(`Insufficient stock for product ${item.productId} in source warehouse`);
                }

                // 3. Create Outbox Events
                await tx.outboxEvent.create({
                    data: {
                        organizationId,
                        topic: 'inventory.movement.created',
                        payload: { productId: item.productId, warehouseId: fromWarehouseId, organizationId }
                    }
                });

                await tx.outboxEvent.create({
                    data: {
                        organizationId,
                        topic: 'inventory.movement.created',
                        payload: { productId: item.productId, warehouseId: toWarehouseId, organizationId }
                    }
                });
            }

            return transfer;
        });

        // Invalidate cache immediately
        for (const item of items) {
            await cache.invalidate(`tenant:${organizationId}:product:${item.productId}`);
        }
        await cache.invalidatePattern(`tenant:${organizationId}:products:*`);
        await cache.invalidate(`tenant:${organizationId}:inventory:stats`);

        return result;
    }

    static async createStockOpname(data: {
        warehouseId: string;
        notes?: string | null;
        items: Array<{ productId: string; actualQty: number }>;
        organizationId: string;
        userId: string;
    }) {
        const { warehouseId, notes, items, organizationId, userId } = data;

        const result = await prisma.$transaction(async (tx) => {
            const opnameNumber = `OPN-${Date.now()}`;
            // 1. Create Stock Opname record
            const opname = await tx.stockOpname.create({
                data: {
                    opnameNumber,
                    warehouseId,
                    notes,
                    organizationId,
                    createdById: userId,
                    status: 'COMPLETED',
                    items: {
                        create: items.map(item => ({
                            productId: item.productId,
                            actualQty: item.actualQty,
                            systemQty: 0,
                        }))
                    }
                },
                include: { items: true }
            });

            // 2. Adjust inventory for each item
            for (const item of items) {
                // Get all batches for this product/warehouse to calculate system quantity
                const batches = await tx.inventoryItem.findMany({
                    where: { productId: item.productId, warehouseId }
                });

                const systemQty = batches.reduce((acc, b) => acc + b.quantityOnHand, 0);
                const adjustmentQty = item.actualQty - systemQty;

                if (adjustmentQty !== 0) {
                    // Link to the newest batch if increasing, or newest batches for decrease?
                    // For Opname, we usually create a new "Adjustment Batch" to keep it clean.
                    const product = await tx.product.findUnique({ where: { id: item.productId } });

                    const adjustmentBatch = await tx.inventoryItem.create({
                        data: {
                            productId: item.productId,
                            warehouseId,
                            unitCost: product?.costPrice || 0,
                            quantityOnHand: adjustmentQty,
                            availableQty: adjustmentQty,
                            batchNumber: `OPN-${opname.opnameNumber}`,
                            receivedDate: new Date(),
                        }
                    });

                    await tx.inventoryMovement.create({
                        data: {
                            productId: item.productId,
                            warehouseId,
                            inventoryItemId: adjustmentBatch.id,
                            movementType: 'ADJUST',
                            quantity: adjustmentQty,
                            referenceType: 'StockOpname',
                            referenceId: opname.id,
                            notes: `Opname adjustment: ${notes || ''}`,
                            createdById: userId,
                        }
                    });

                    // 3. Create Outbox Event
                    await tx.outboxEvent.create({
                        data: {
                            organizationId,
                            topic: 'inventory.movement.created',
                            payload: { productId: item.productId, warehouseId, organizationId }
                        }
                    });
                }

                await tx.stockOpnameItem.updateMany({
                    where: { opnameId: opname.id, productId: item.productId },
                    data: {
                        systemQty,
                        difference: item.actualQty - systemQty
                    }
                });
            }

            return opname;
        });

        // Invalidate cache immediately
        for (const item of items) {
            await cache.invalidate(`tenant:${organizationId}:product:${item.productId}`);
        }
        await cache.invalidatePattern(`tenant:${organizationId}:products:*`);
        await cache.invalidate(`tenant:${organizationId}:inventory:stats`);

        return result;
    }

    static async getMovements(organizationId: string, params: { productId?: string; warehouseId?: string; type?: string; page?: number; pageSize?: number } = {}) {
        const { productId, warehouseId, type, page = 1, pageSize = 10 } = params;
        const skip = (page - 1) * pageSize;

        const where: any = {
            product: {
                organizationId
            }
        };

        if (productId) where.productId = productId;
        if (warehouseId) where.warehouseId = warehouseId;
        if (type) where.movementType = type;

        const [movements, total] = await Promise.all([
            prisma.inventoryMovement.findMany({
                where,
                include: {
                    product: true,
                    warehouse: true,
                    createdBy: true
                },
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.inventoryMovement.count({ where })
        ]);

        return { movements, total };
    }
}
