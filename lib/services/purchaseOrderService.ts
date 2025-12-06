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

export type CreatePurchaseOrderDraftParams = {
    organizationId: string;
    supplierId: string;
    warehouseId: string;
    items: {
        productId: string;
        quantity: number;
        unitCost: number;
    }[];
    notes?: string;
    createdById: string;
};

export const purchaseOrderService = {
    /**
     * Creates a Purchase Order in DRAFT status.
     */
    async createPurchaseOrderDraft(params: CreatePurchaseOrderDraftParams) {
        const { organizationId, supplierId, warehouseId, items, notes, createdById } = params;

        return await prisma.$transaction(async (tx) => {
            const poNumber = `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            let subtotal = 0;
            const orderItemsData = [];

            for (const item of items) {
                const lineTotal = item.quantity * item.unitCost;
                subtotal += lineTotal;

                orderItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitCost: item.unitCost,
                    lineTotal,
                });
            }

            const total = subtotal; // Tax handling can be added here

            const purchaseOrder = await tx.purchaseOrder.create({
                data: {
                    poNumber,
                    supplierId,
                    warehouseId,
                    organizationId,
                    status: PurchaseOrderStatus.DRAFT,
                    notes,
                    subtotal,
                    tax: 0,
                    total,
                    createdById,
                    items: {
                        create: orderItemsData,
                    },
                },
                include: {
                    items: true,
                },
            });

            return purchaseOrder;
        });
    },
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
                    }, tx);
                }
            }

            return receipt;
        });
    },
};
