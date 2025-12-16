import { prisma } from '../lib/prisma.js';
import { AdjustmentReason } from '@prisma/client';

export interface CreateStockAdjustmentData {
    productId: string;
    warehouseId: string;
    type: 'increase' | 'decrease';
    quantity: number;
    reason: string;
    notes?: string;
    organizationId: string;
    userId: string;
}

export class InventoryService {
    static async createStockAdjustment(data: CreateStockAdjustmentData) {
        const { productId, warehouseId, type, quantity, reason, notes, organizationId, userId } = data;

        return await prisma.$transaction(async (tx) => {
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
                    notes,
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

            if (inventoryItem) {
                await tx.inventoryItem.update({
                    where: { id: inventoryItem.id },
                    data: {
                        quantityOnHand: {
                            increment: type === 'increase' ? quantity : -quantity
                        },
                        availableQty: {
                            increment: type === 'increase' ? quantity : -quantity
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

            return adjustment;
        });
    }

    static async getInventory(organizationId: string) {
        return await prisma.inventoryItem.findMany({
            where: {
                warehouse: {
                    organizationId
                }
            },
            include: {
                product: true,
                warehouse: true
            },
            take: 100
        });
    }
}
