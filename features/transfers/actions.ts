'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { generateOrderNumber } from '@/lib/utils';

export async function createStockTransfer(formData: FormData) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const fromWarehouseId = formData.get('fromWarehouseId') as string;
    const toWarehouseId = formData.get('toWarehouseId') as string;
    const notes = formData.get('notes') as string;
    const itemsJson = formData.get('items') as string;

    if (fromWarehouseId === toWarehouseId) {
        throw new Error('Source and destination warehouses must be different');
    }

    const items = JSON.parse(itemsJson) as Array<{
        productId: string;
        quantity: number;
    }>;

    const transfer = await prisma.$transaction(async (tx) => {
        const transferNumber = generateOrderNumber('TR');

        const stockTransfer = await tx.stockTransfer.create({
            data: {
                transferNumber,
                fromWarehouseId,
                toWarehouseId,
                status: 'DRAFT',
                notes: notes || null,
                organizationId: session.user.organizationId!,
                createdById: session.user.id,
            },
        });

        for (const item of items) {
            await tx.stockTransferItem.create({
                data: {
                    stockTransferId: stockTransfer.id,
                    productId: item.productId,
                    quantity: item.quantity,
                },
            });
        }

        return stockTransfer;
    });

    revalidatePath('/transfers');
    redirect('/transfers');
}

export async function completeStockTransfer(transferId: string) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    await prisma.$transaction(async (tx) => {
        const transfer = await tx.stockTransfer.findFirst({
            where: {
                id: transferId,
                organizationId: session.user.organizationId!,
            },
            include: {
                items: true,
            },
        });

        if (!transfer || transfer.status !== 'IN_TRANSIT') {
            throw new Error('Invalid transfer status');
        }

        // Create movements for both warehouses
        for (const item of transfer.items) {
            // OUT from source
            await tx.inventoryMovement.create({
                data: {
                    productId: item.productId,
                    warehouseId: transfer.fromWarehouseId,
                    movementType: 'TRANSFER_OUT',
                    quantity: -item.quantity,
                    referenceType: 'StockTransfer',
                    referenceId: transfer.id,
                    notes: `Transfer ${transfer.transferNumber}`,
                    createdById: session.user.id,
                },
            });

            // IN to destination
            await tx.inventoryMovement.create({
                data: {
                    productId: item.productId,
                    warehouseId: transfer.toWarehouseId,
                    movementType: 'TRANSFER_IN',
                    quantity: item.quantity,
                    referenceType: 'StockTransfer',
                    referenceId: transfer.id,
                    notes: `Transfer ${transfer.transferNumber}`,
                    createdById: session.user.id,
                },
            });

            // Update source warehouse
            const sourceItem = await tx.inventoryItem.findUnique({
                where: {
                    productId_warehouseId: {
                        productId: item.productId,
                        warehouseId: transfer.fromWarehouseId,
                    },
                },
            });

            if (sourceItem) {
                const newQty = sourceItem.quantityOnHand - item.quantity;
                await tx.inventoryItem.update({
                    where: { id: sourceItem.id },
                    data: {
                        quantityOnHand: newQty,
                        availableQty: newQty - sourceItem.allocatedQty,
                    },
                });
            }

            // Update destination warehouse
            const destItem = await tx.inventoryItem.findUnique({
                where: {
                    productId_warehouseId: {
                        productId: item.productId,
                        warehouseId: transfer.toWarehouseId,
                    },
                },
            });

            if (destItem) {
                const newQty = destItem.quantityOnHand + item.quantity;
                await tx.inventoryItem.update({
                    where: { id: destItem.id },
                    data: {
                        quantityOnHand: newQty,
                        availableQty: newQty - destItem.allocatedQty,
                    },
                });
            } else {
                await tx.inventoryItem.create({
                    data: {
                        productId: item.productId,
                        warehouseId: transfer.toWarehouseId,
                        quantityOnHand: item.quantity,
                        allocatedQty: 0,
                        availableQty: item.quantity,
                    },
                });
            }
        }

        await tx.stockTransfer.update({
            where: { id: transferId },
            data: {
                status: 'COMPLETED',
                completedDate: new Date(),
            },
        });
    });

    revalidatePath('/transfers');
    revalidatePath(`/transfers/${transferId}`);
}
