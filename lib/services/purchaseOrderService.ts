import { prisma } from "@/lib/prisma";
import { PurchaseOrderStatus, MovementType } from "@prisma/client";
import { inventoryService } from "./inventoryService";

export type CreatePurchaseReceiptParams = {
    purchaseOrderId: string;
    organizationId: string;
    receivedItems: {
        productId: string;
        quantity: number;
    }[];
    notes?: string;
    userId: string;
};

export const purchaseOrderService = {
    /**
     * Receives items for a Purchase Order.
     * Creates PurchaseReceipt and IN inventory movements.
     * Updates PO status based on received quantities.
     */
    async createPurchaseReceipt(params: CreatePurchaseReceiptParams) {
        const { purchaseOrderId, organizationId, receivedItems, notes, userId } = params;

        // Fetch PO with items
        const po = await prisma.purchaseOrder.findUnique({
            where: { id: purchaseOrderId },
            include: { items: true },
        });

        if (!po || po.organizationId !== organizationId) {
            throw new Error("Purchase Order not found or access denied");
        }

        if (po.status === PurchaseOrderStatus.CANCELLED || po.status === PurchaseOrderStatus.COMPLETED) {
            throw new Error(`Cannot receive for order in status ${po.status}`);
        }

        return await prisma.$transaction(async (tx) => {
            // 1. Validate and Update PO Items
            let allItemsFullyReceived = true;
            let atLeastOneItemReceived = false;

            for (const poItem of po.items) {
                const receivedItem = receivedItems.find((ri) => ri.productId === poItem.productId);

                const currentReceived = poItem.receivedQty;
                const incomingQty = receivedItem ? receivedItem.quantity : 0;
                const totalReceived = currentReceived + incomingQty;

                if (totalReceived > poItem.quantity) {
                    throw new Error(`Cannot receive more than ordered for product ${poItem.productId}`);
                }

                if (incomingQty > 0) {
                    atLeastOneItemReceived = true;
                    // Update PO Item receivedQty
                    await tx.purchaseOrderItem.update({
                        where: { id: poItem.id },
                        data: { receivedQty: totalReceived },
                    });
                }

                if (totalReceived < poItem.quantity) {
                    allItemsFullyReceived = false;
                }
            }

            if (!atLeastOneItemReceived) {
                throw new Error("No items received");
            }

            // 2. Determine New PO Status
            let newStatus = po.status;
            if (allItemsFullyReceived) {
                newStatus = PurchaseOrderStatus.COMPLETED;
            } else {
                newStatus = PurchaseOrderStatus.PARTIALLY_RECEIVED;
            }

            if (newStatus !== po.status) {
                await tx.purchaseOrder.update({
                    where: { id: po.id },
                    data: { status: newStatus },
                });
            }

            // 3. Create PurchaseReceipt
            const receiptNumber = `REC-${Date.now()}`;
            const receipt = await tx.purchaseReceipt.create({
                data: {
                    purchaseOrderId,
                    receiptNumber,
                    notes,
                    receivedItems: receivedItems as any, // JSON
                },
            });

            // 4. Create Inventory Movements (IN)
            for (const item of receivedItems) {
                if (item.quantity > 0) {
                    await inventoryService.createInventoryMovement({
                        organizationId,
                        warehouseId: po.warehouseId,
                        productId: item.productId,
                        movementType: MovementType.IN,
                        quantity: item.quantity,
                        referenceType: "PurchaseOrder",
                        referenceId: po.id,
                        createdById: userId,
                        notes: `Receipt ${receiptNumber} for PO ${po.poNumber}`,
                    });
                }
            }

            return receipt;
        });
    },
};
