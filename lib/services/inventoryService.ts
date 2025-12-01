import { prisma } from "@/lib/prisma";
import { MovementType, Prisma } from "@prisma/client";

export type CreateInventoryMovementParams = {
    organizationId: string;
    warehouseId: string;
    productId: string;
    movementType: MovementType;
    quantity: number;
    referenceType?: string;
    referenceId?: string;
    notes?: string;
    createdById: string;
};

export const inventoryService = {
    /**
     * Creates an inventory movement and updates the inventory item cache.
     * This is the ONLY way to change stock levels.
     */
    async createInventoryMovement(params: CreateInventoryMovementParams) {
        const {
            organizationId,
            warehouseId,
            productId,
            movementType,
            quantity,
            referenceType,
            referenceId,
            notes,
            createdById,
        } = params;

        return await prisma.$transaction(async (tx) => {
            // 1. Validate product and warehouse belong to the same organization
            const product = await tx.product.findUnique({
                where: { id: productId },
                select: { organizationId: true },
            });

            const warehouse = await tx.warehouse.findUnique({
                where: { id: warehouseId },
                select: { organizationId: true },
            });

            if (!product || product.organizationId !== organizationId) {
                throw new Error("Product not found or does not belong to this organization");
            }

            if (!warehouse || warehouse.organizationId !== organizationId) {
                throw new Error("Warehouse not found or does not belong to this organization");
            }

            // 2. Create the InventoryMovement (Append-Only Ledger)
            const movement = await tx.inventoryMovement.create({
                data: {
                    productId,
                    warehouseId,
                    movementType,
                    quantity,
                    referenceType,
                    referenceId,
                    notes,
                    createdById,
                },
            });

            // 3. Update InventoryItem cache
            // We use upsert to ensure the item exists
            const currentItem = await tx.inventoryItem.findUnique({
                where: {
                    productId_warehouseId: {
                        productId,
                        warehouseId,
                    },
                },
            });

            const currentQty = currentItem?.quantityOnHand || 0;
            const newQty = currentQty + quantity;

            if (newQty < 0) {
                throw new Error(
                    `Insufficient stock. Current: ${currentQty}, Requested change: ${quantity}, Result: ${newQty}`
                );
            }

            const allocatedQty = currentItem?.allocatedQty || 0;
            const availableQty = newQty - allocatedQty;

            await tx.inventoryItem.upsert({
                where: {
                    productId_warehouseId: {
                        productId,
                        warehouseId,
                    },
                },
                create: {
                    productId,
                    warehouseId,
                    quantityOnHand: newQty,
                    allocatedQty: 0,
                    availableQty: newQty,
                },
                update: {
                    quantityOnHand: newQty,
                    availableQty: availableQty,
                },
            });

            return movement;
        });
    },

    /**
     * Get current stock for a product in a warehouse
     */
    async getStock(productId: string, warehouseId: string) {
        const item = await prisma.inventoryItem.findUnique({
            where: {
                productId_warehouseId: {
                    productId,
                    warehouseId,
                },
            },
        });
        return item;
    },
};
