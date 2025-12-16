import { prisma } from '../lib/prisma.js';

export interface CreateOrderData {
    organizationId: string;
    userId: string;
    customerId?: string;
    orderNumber: string;
    status?: string;
    paymentStatus?: string;
    items: {
        productId: string;
        quantity: number;
        price: number;
    }[];
}

export class OrderService {
    static async createOrder(data: CreateOrderData) {
        const { organizationId, userId, customerId, orderNumber, items } = data;

        return await prisma.$transaction(async (tx) => {
            // 1. Create the Sales Order
            const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const warehouse = await tx.warehouse.findFirst({
                where: { organizationId, isActive: true }
            });
            if (!warehouse) throw new Error('No active warehouse found');

            const order = await tx.salesOrder.create({
                data: {
                    organizationId,
                    orderNumber,
                    customerId,
                    warehouseId: warehouse.id,
                    status: 'CONFIRMED', // Using valid Enum 'CONFIRMED'
                    // paymentStatus: 'PAID', // Not in schema?
                    subtotal: subtotal,
                    tax: 0,
                    discount: 0,
                    total: subtotal,
                    createdById: userId,
                    items: {
                        create: items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.price,
                            lineTotal: item.price * item.quantity
                        }))
                    }
                },
                include: { items: true }
            });

            // 2. Deduct Stock (Inventory Movement)
            // We assume a default warehouse for now, or it should be passed in data
            // For MVP, finding the first active warehouse
            // Warehouse already found above

            for (const item of items) {
                // Decrease QuantityOnHand
                await tx.inventoryItem.updateMany({
                    where: {
                        productId: item.productId,
                        warehouseId: warehouse.id
                    },
                    data: {
                        quantityOnHand: { decrement: item.quantity },
                        availableQty: { decrement: item.quantity }
                    }
                });

                // Log Movement
                await tx.inventoryMovement.create({
                    data: {
                        productId: item.productId,
                        warehouseId: warehouse.id,
                        movementType: 'OUT',
                        quantity: item.quantity,
                        referenceType: 'SalesOrder',
                        referenceId: order.id,
                        notes: `Sales Order ${order.orderNumber}`,
                        createdById: userId
                    }
                });
            }

            return order;
        });
    }
}
