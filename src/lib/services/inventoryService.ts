import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { CreateInventoryMovementParams } from "@/types/domain";

export const inventoryService = {
    /**
     * Creates an inventory movement and updates the inventory item cache.
     * This is the ONLY way to change stock levels.
     */
    async createInventoryMovement(params: CreateInventoryMovementParams, tx?: Prisma.TransactionClient) {
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

        const execute = async (db: Prisma.TransactionClient) => {
            // 1. Validate product and warehouse belong to the same organization
            // Optimization: We could pass these checks if we trust the caller, but for safety we keep them.
            // For batch operations, we might want to skip this or do it in bulk.
            const product = await db.product.findUnique({
                where: { id: productId },
                select: { organizationId: true },
            });

            const warehouse = await db.warehouse.findUnique({
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
            const movement = await db.inventoryMovement.create({
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
            const currentItem = await db.inventoryItem.findUnique({
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

            await db.inventoryItem.upsert({
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
        };

        if (tx) {
            return execute(tx);
        }

        return await prisma.$transaction(execute);
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

    /**
     * Get paginated inventory list
     */
    async getInventory(organizationId: string, page: number = 1, pageSize: number = 10, search: string = '') {
        const skip = (page - 1) * pageSize;

        const where: Prisma.ProductWhereInput = {
            organizationId,
            deletedAt: null,
            OR: search
                ? [
                    { name: { contains: search, mode: 'insensitive' } },
                    { sku: { contains: search, mode: 'insensitive' } },
                ]
                : undefined,
        };

        const [products, total] = await prisma.$transaction([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    inventoryItems: {
                        include: {
                            warehouse: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            prisma.product.count({
                where,
            }),
        ]);

        return { products, total };
    },
};

