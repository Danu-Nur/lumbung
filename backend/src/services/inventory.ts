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

            // 3. Update Inventory Item
            const inventoryItem = await tx.inventoryItem.findUnique({
                where: {
                    productId_warehouseId: {
                        productId,
                        warehouseId
                    }
                }
            });

            const diff = type === 'increase' ? quantity : -quantity;

            if (inventoryItem) {
                await tx.inventoryItem.update({
                    where: { id: inventoryItem.id },
                    data: {
                        quantityOnHand: {
                            increment: diff
                        },
                        availableQty: {
                            increment: diff
                        }
                    }
                });
            } else {
                if (type === 'decrease') {
                    throw new Error('Cannot decrease stock for non-existent inventory item');
                }
                await tx.inventoryItem.create({
                    data: {
                        productId,
                        warehouseId,
                        quantityOnHand: quantity,
                        availableQty: quantity,
                        allocatedQty: 0
                    }
                });
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
            warehouse: {
                organizationId
            }
        };

        if (q) {
            where.product = {
                OR: [
                    { name: { contains: q, mode: 'insensitive' } },
                    { sku: { contains: q, mode: 'insensitive' } }
                ]
            };
        }

        const [items, total] = await Promise.all([
            prisma.inventoryItem.findMany({
                where,
                include: {
                    product: true,
                    warehouse: true
                },
                skip,
                take: pageSize,
                orderBy: { product: { name: 'asc' } }
            }),
            prisma.inventoryItem.count({ where })
        ]);

        return { items, total };
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

            // 2. Create Movements and Update Inventory for each item
            for (const item of items) {
                // Outbound movement
                await tx.inventoryMovement.create({
                    data: {
                        productId: item.productId,
                        warehouseId: fromWarehouseId,
                        movementType: 'TRANSFER_OUT',
                        quantity: -item.quantity,
                        referenceType: 'StockTransfer',
                        referenceId: transfer.id,
                        notes: `Transfer to ${toWarehouseId}`,
                        createdById: userId,
                    }
                });

                // Inbound movement
                await tx.inventoryMovement.create({
                    data: {
                        productId: item.productId,
                        warehouseId: toWarehouseId,
                        movementType: 'TRANSFER_IN',
                        quantity: item.quantity,
                        referenceType: 'StockTransfer',
                        referenceId: transfer.id,
                        notes: `Transfer from ${fromWarehouseId}`,
                        createdById: userId,
                    }
                });

                // Update From Warehouse inventory
                await tx.inventoryItem.upsert({
                    where: { productId_warehouseId: { productId: item.productId, warehouseId: fromWarehouseId } },
                    update: {
                        quantityOnHand: { decrement: item.quantity },
                        availableQty: { decrement: item.quantity }
                    },
                    create: {
                        productId: item.productId,
                        warehouseId: fromWarehouseId,
                        quantityOnHand: -item.quantity,
                        availableQty: -item.quantity,
                        allocatedQty: 0
                    }
                });

                // Update To Warehouse inventory
                await tx.inventoryItem.upsert({
                    where: { productId_warehouseId: { productId: item.productId, warehouseId: toWarehouseId } },
                    update: {
                        quantityOnHand: { increment: item.quantity },
                        availableQty: { increment: item.quantity }
                    },
                    create: {
                        productId: item.productId,
                        warehouseId: toWarehouseId,
                        quantityOnHand: item.quantity,
                        availableQty: item.quantity,
                        allocatedQty: 0
                    }
                });

                // 3. Create Outbox Events
                await tx.outboxEvent.create({
                    data: {
                        organizationId,
                        topic: 'inventory.movement.created',
                        payload: {
                            productId: item.productId,
                            warehouseId: fromWarehouseId,
                            organizationId,
                            movementId: transfer.id,
                            type: 'transfer_out'
                        }
                    }
                });

                await tx.outboxEvent.create({
                    data: {
                        organizationId,
                        topic: 'inventory.movement.created',
                        payload: {
                            productId: item.productId,
                            warehouseId: toWarehouseId,
                            organizationId,
                            movementId: transfer.id,
                            type: 'transfer_in'
                        }
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
                const existing = await tx.inventoryItem.findUnique({
                    where: { productId_warehouseId: { productId: item.productId, warehouseId } }
                });

                const systemQty = existing?.quantityOnHand || 0;
                const adjustmentQty = item.actualQty - systemQty;

                if (adjustmentQty !== 0) {
                    await tx.inventoryMovement.create({
                        data: {
                            productId: item.productId,
                            warehouseId,
                            movementType: 'ADJUST',
                            quantity: adjustmentQty,
                            referenceType: 'StockOpname',
                            referenceId: opname.id,
                            notes: `Opname adjustment: ${notes || ''}`,
                            createdById: userId,
                        }
                    });

                    await tx.inventoryItem.upsert({
                        where: { productId_warehouseId: { productId: item.productId, warehouseId } },
                        update: {
                            quantityOnHand: item.actualQty,
                            availableQty: item.actualQty - (existing?.allocatedQty || 0)
                        },
                        create: {
                            productId: item.productId,
                            warehouseId,
                            quantityOnHand: item.actualQty,
                            availableQty: item.actualQty,
                            allocatedQty: 0
                        }
                    });

                    // 3. Create Outbox Event
                    await tx.outboxEvent.create({
                        data: {
                            organizationId,
                            topic: 'inventory.movement.created',
                            payload: {
                                productId: item.productId,
                                warehouseId,
                                organizationId,
                                movementId: opname.id,
                                type: 'opname'
                            }
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
