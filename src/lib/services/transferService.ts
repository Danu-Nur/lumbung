import { prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { inventoryService } from "./inventoryService";

interface CreateTransferParams {
    organizationId: string;
    createdById: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    notes?: string;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
}

export const transferService = {
    async createTransferDraft(params: CreateTransferParams) {
        const {
            organizationId,
            createdById,
            fromWarehouseId,
            toWarehouseId,
            notes,
            items,
        } = params;

        if (fromWarehouseId === toWarehouseId) {
            throw new Error('Cannot transfer to the same warehouse');
        }

        if (items.length === 0) {
            throw new Error('Transfer must have at least one item');
        }

        return await prisma.$transaction(async (tx) => {
            const transferNumber = generateOrderNumber('TR');

            const stockTransfer = await tx.stockTransfer.create({
                data: {
                    transferNumber,
                    fromWarehouseId,
                    toWarehouseId,
                    status: 'DRAFT',
                    notes: notes || null,
                    organizationId,
                    createdById,
                },
            });

            // Optimization: Use createMany for items
            await tx.stockTransferItem.createMany({
                data: items.map((item) => ({
                    stockTransferId: stockTransfer.id,
                    productId: item.productId,
                    quantity: item.quantity,
                })),
            });

            return stockTransfer;
        });
    },

    async sendTransfer(transferId: string, userId: string, organizationId: string) {
        return await prisma.$transaction(async (tx) => {
            const transfer = await tx.stockTransfer.findUnique({
                where: { id: transferId },
                include: { items: true },
            });

            if (!transfer) throw new Error('Transfer not found');
            if (transfer.organizationId !== organizationId) throw new Error('Unauthorized');
            if (transfer.status !== 'DRAFT') throw new Error('Transfer must be in DRAFT status to send');

            // Deduct from source warehouse
            for (const item of transfer.items) {
                await inventoryService.createInventoryMovement({
                    organizationId,
                    warehouseId: transfer.fromWarehouseId,
                    productId: item.productId,
                    movementType: 'TRANSFER_OUT',
                    quantity: -item.quantity,
                    referenceType: 'StockTransfer',
                    referenceId: transfer.id,
                    notes: `Transfer Out ${transfer.transferNumber}`,
                    createdById: userId,
                }, tx);
            }

            await tx.stockTransfer.update({
                where: { id: transferId },
                data: { status: 'IN_TRANSIT' },
            });

            return transfer;
        });
    },

    async completeTransfer(transferId: string, userId: string, organizationId: string) {
        return await prisma.$transaction(async (tx) => {
            const transfer = await tx.stockTransfer.findUnique({
                where: { id: transferId },
                include: { items: true },
            });

            if (!transfer) throw new Error('Transfer not found');
            if (transfer.organizationId !== organizationId) throw new Error('Unauthorized');
            if (transfer.status !== 'IN_TRANSIT') throw new Error('Transfer must be IN_TRANSIT to complete');

            // Add to destination warehouse
            for (const item of transfer.items) {
                await inventoryService.createInventoryMovement({
                    organizationId,
                    warehouseId: transfer.toWarehouseId,
                    productId: item.productId,
                    movementType: 'TRANSFER_IN',
                    quantity: item.quantity,
                    referenceType: 'StockTransfer',
                    referenceId: transfer.id,
                    notes: `Transfer In ${transfer.transferNumber}`,
                    createdById: userId,
                }, tx);
            }

            await tx.stockTransfer.update({
                where: { id: transferId },
                data: {
                    status: 'COMPLETED',
                    completedDate: new Date(),
                },
            });

            return transfer;
        });
    },
};
