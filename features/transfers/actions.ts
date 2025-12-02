'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { generateOrderNumber } from '@/lib/utils';

export async function createTransfer(formData: FormData) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const fromWarehouseId = formData.get('fromWarehouseId') as string;
    const toWarehouseId = formData.get('toWarehouseId') as string;
    const notes = formData.get('notes') as string;
    const itemsJson = formData.get('items') as string;

    if (!fromWarehouseId || !toWarehouseId || !itemsJson) {
        throw new Error('Missing required fields');
    }

    if (fromWarehouseId === toWarehouseId) {
        throw new Error('Cannot transfer to the same warehouse');
    }

    const items = JSON.parse(itemsJson) as Array<{
        productId: string;
        quantity: number;
    }>;

    if (items.length === 0) {
        throw new Error('Transfer must have at least one item');
    }

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

export async function sendTransfer(transferId: string) {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) throw new Error('Unauthorized');

    await prisma.$transaction(async (tx) => {
        const transfer = await tx.stockTransfer.findUnique({
            where: { id: transferId },
            include: { items: true },
        });

        if (!transfer) throw new Error('Transfer not found');
        if (transfer.status !== 'DRAFT') throw new Error('Transfer must be in DRAFT status to send');

        // Deduct from source warehouse
        for (const item of transfer.items) {
            // Check stock availability
            const inventory = await tx.inventoryItem.findUnique({
                where: {
                    productId_warehouseId: {
                        productId: item.productId,
                        warehouseId: transfer.fromWarehouseId,
                    },
                },
            });

            if (!inventory || inventory.availableQty < item.quantity) {
                throw new Error(`Insufficient stock for product ${item.productId}`);
            }

            // Create OUT movement
            await tx.inventoryMovement.create({
                data: {
                    productId: item.productId,
                    warehouseId: transfer.fromWarehouseId,
                    movementType: 'TRANSFER_OUT',
                    quantity: -item.quantity,
                    referenceType: 'StockTransfer',
                    referenceId: transfer.id,
                    notes: `Transfer Out ${transfer.transferNumber}`,
                    createdById: session.user.id,
                },
            });

            // Update inventory
            await tx.inventoryItem.update({
                where: { id: inventory.id },
                data: {
                    quantityOnHand: { decrement: item.quantity },
                    availableQty: { decrement: item.quantity },
                },
            });
        }

        await tx.stockTransfer.update({
            where: { id: transferId },
            data: { status: 'IN_TRANSIT' },
        });
    });

    revalidatePath('/transfers');
    revalidatePath(`/transfers/${transferId}`);
}

export async function completeTransfer(transferId: string) {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) throw new Error('Unauthorized');

    await prisma.$transaction(async (tx) => {
        const transfer = await tx.stockTransfer.findUnique({
            where: { id: transferId },
            include: { items: true },
        });

        if (!transfer) throw new Error('Transfer not found');
        if (transfer.status !== 'IN_TRANSIT') throw new Error('Transfer must be IN_TRANSIT to complete');

        // Add to destination warehouse
        for (const item of transfer.items) {
            // Create IN movement
            await tx.inventoryMovement.create({
                data: {
                    productId: item.productId,
                    warehouseId: transfer.toWarehouseId,
                    movementType: 'TRANSFER_IN',
                    quantity: item.quantity,
                    referenceType: 'StockTransfer',
                    referenceId: transfer.id,
                    notes: `Transfer In ${transfer.transferNumber}`,
                    createdById: session.user.id,
                },
            });

            // Update inventory
            const inventory = await tx.inventoryItem.findUnique({
                where: {
                    productId_warehouseId: {
                        productId: item.productId,
                        warehouseId: transfer.toWarehouseId,
                    },
                },
            });

            if (inventory) {
                await tx.inventoryItem.update({
                    where: { id: inventory.id },
                    data: {
                        quantityOnHand: { increment: item.quantity },
                        availableQty: { increment: item.quantity },
                    },
                });
            } else {
                await tx.inventoryItem.create({
                    data: {
                        productId: item.productId,
                        warehouseId: transfer.toWarehouseId,
                        quantityOnHand: item.quantity,
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
