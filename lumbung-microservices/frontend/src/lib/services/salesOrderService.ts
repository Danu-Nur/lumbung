import { prisma } from "@/lib/prisma";
import { SalesOrderStatus, MovementType } from "@prisma/client";
import { inventoryService } from "./inventoryService";

export type CreateSalesOrderDraftParams = {
    organizationId: string;
    customerId: string;
    warehouseId: string;
    items: {
        productId: string;
        quantity: number;
        unitPrice?: number; // Optional, defaults to product selling price
        discount?: number;
    }[];
    notes?: string;
    createdById: string;
};

export const salesOrderService = {
    /**
     * Creates a Sales Order in DRAFT status.
     * Snapshots the current selling price for each item.
     */
    async createSalesOrderDraft(params: CreateSalesOrderDraftParams) {
        const { organizationId, customerId, warehouseId, items, notes, createdById } = params;

        return await prisma.$transaction(async (tx) => {
            // 1. Generate Order Number (simple timestamp based for now, or random)
            const orderNumber = `SO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            // 2. Calculate totals and prepare items
            let subtotal = 0;
            const orderItemsData = [];

            for (const item of items) {
                // Fetch product for price if not provided
                const product = await tx.product.findUnique({
                    where: { id: item.productId },
                });

                if (!product || product.organizationId !== organizationId) {
                    throw new Error(`Product ${item.productId} not found or invalid`);
                }

                const unitPrice = item.unitPrice ?? Number(product.sellingPrice);
                const discount = item.discount ?? 0;
                const lineTotal = item.quantity * unitPrice - discount;

                subtotal += lineTotal;

                orderItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice,
                    discount,
                    lineTotal,
                });
            }

            // Simple tax calculation (e.g. 0 for now, or passed in)
            const tax = 0;
            const total = subtotal + tax;

            // 3. Create Sales Order
            const salesOrder = await tx.salesOrder.create({
                data: {
                    orderNumber,
                    customerId,
                    warehouseId,
                    organizationId,
                    status: SalesOrderStatus.DRAFT,
                    notes,
                    subtotal,
                    tax,
                    discount: 0, // Order level discount
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

            return salesOrder;
        });
    },

    /**
     * Fulfills a Sales Order.
     * Validates status and creates OUT inventory movements.
     */
    async fulfillSalesOrder(salesOrderId: string, organizationId: string, userId: string) {
        // We need to fetch the order first to get details
        const order = await prisma.salesOrder.findUnique({
            where: { id: salesOrderId },
            include: { items: true },
        });

        if (!order || order.organizationId !== organizationId) {
            throw new Error("Sales Order not found or access denied");
        }

        if (order.status === SalesOrderStatus.FULFILLED || order.status === SalesOrderStatus.CANCELLED) {
            throw new Error(`Cannot fulfill order in status ${order.status}`);
        }

        // Execute fulfillment in transaction
        return await prisma.$transaction(async (tx) => {
            // 1. Update Order Status
            const updatedOrder = await tx.salesOrder.update({
                where: { id: salesOrderId },
                data: {
                    status: SalesOrderStatus.FULFILLED,
                    updatedAt: new Date(),
                },
            });

            // 2. Create Inventory Movements (OUT)
            for (const item of order.items) {
                await inventoryService.createInventoryMovement({
                    organizationId,
                    warehouseId: order.warehouseId,
                    productId: item.productId,
                    movementType: MovementType.OUT,
                    quantity: -item.quantity, // Negative for OUT
                    referenceType: "SalesOrder",
                    referenceId: order.id,
                    createdById: userId,
                    notes: `Fulfillment of SO ${order.orderNumber}`,
                }, tx);
            }

            return updatedOrder;
        });
    },
    /**
     * Confirms a Sales Order.
     * Allocates stock for the order items.
     */
    async confirmSalesOrder(orderId: string, organizationId: string) {
        return await prisma.$transaction(async (tx) => {
            const order = await tx.salesOrder.findFirst({
                where: { id: orderId, organizationId },
                include: { items: true },
            });

            if (!order) throw new Error('Order not found');
            if (order.status !== SalesOrderStatus.DRAFT) throw new Error('Only draft orders can be confirmed');

            // Allocate stock
            for (const item of order.items) {
                const inventoryItem = await tx.inventoryItem.findUnique({
                    where: {
                        productId_warehouseId: {
                            productId: item.productId,
                            warehouseId: order.warehouseId,
                        },
                    },
                });

                if (inventoryItem) {
                    const newAllocated = inventoryItem.allocatedQty + item.quantity;
                    const newAvailable = inventoryItem.quantityOnHand - newAllocated;

                    await tx.inventoryItem.update({
                        where: { id: inventoryItem.id },
                        data: {
                            allocatedQty: newAllocated,
                            availableQty: newAvailable,
                        },
                    });
                }
            }

            return await tx.salesOrder.update({
                where: { id: orderId },
                data: { status: SalesOrderStatus.CONFIRMED },
            });
        });
    },

    /**
     * Cancels a Sales Order.
     * Releases allocated stock if the order was confirmed.
     */
    async cancelSalesOrder(orderId: string, organizationId: string) {
        return await prisma.$transaction(async (tx) => {
            const order = await tx.salesOrder.findFirst({
                where: { id: orderId, organizationId },
                include: { items: true },
            });

            if (!order) throw new Error('Order not found');
            if (order.status === SalesOrderStatus.FULFILLED || order.status === SalesOrderStatus.CANCELLED) {
                throw new Error('Cannot cancel fulfilled or already cancelled orders');
            }

            // If order was confirmed, release allocated stock
            if (order.status === SalesOrderStatus.CONFIRMED) {
                for (const item of order.items) {
                    const inventoryItem = await tx.inventoryItem.findUnique({
                        where: {
                            productId_warehouseId: {
                                productId: item.productId,
                                warehouseId: order.warehouseId,
                            },
                        },
                    });

                    if (inventoryItem) {
                        const newAllocated = Math.max(0, inventoryItem.allocatedQty - item.quantity);
                        const newAvailable = inventoryItem.quantityOnHand - newAllocated;

                        await tx.inventoryItem.update({
                            where: { id: inventoryItem.id },
                            data: {
                                allocatedQty: newAllocated,
                                availableQty: newAvailable,
                            },
                        });
                    }
                }
            }

            return await tx.salesOrder.update({
                where: { id: orderId },
                data: { status: SalesOrderStatus.CANCELLED },
            });
        });
    },
};
