'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createStockAdjustment(formData: FormData) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const productId = formData.get('productId') as string;
    const warehouseId = formData.get('warehouseId') as string;
    const adjustmentType = formData.get('adjustmentType') as 'increase' | 'decrease';
    const quantity = parseInt(formData.get('quantity') as string);
    const reason = formData.get('reason') as string;
    const notes = formData.get('notes') as string;

    if (!productId || !warehouseId || !adjustmentType || !quantity || !reason) {
        throw new Error('Missing required fields');
    }

    // Validate product and warehouse ownership
    const product = await prisma.product.findFirst({
        where: {
            id: productId,
            organizationId: session.user.organizationId,
            deletedAt: null,
        },
    });

    const warehouse = await prisma.warehouse.findFirst({
        where: {
            id: warehouseId,
            organizationId: session.user.organizationId,
            deletedAt: null,
        },
    });

    if (!product || !warehouse) {
        throw new Error('Product or warehouse not found');
    }

    // Create adjustment and movement in transaction
    await prisma.$transaction(async (tx) => {
        // Create adjustment record
        await tx.stockAdjustment.create({
            data: {
                productId,
                warehouseId,
                adjustmentType,
                quantity,
                reason: reason as any,
                notes: notes || null,
                organizationId: session.user.organizationId!,
                createdById: session.user.id,
            },
        });

        // Create inventory movement
        const movementQuantity = adjustmentType === 'increase' ? quantity : -quantity;
        await tx.inventoryMovement.create({
            data: {
                productId,
                warehouseId,
                movementType: 'ADJUST',
                quantity: movementQuantity,
                referenceType: 'StockAdjustment',
                referenceId: 'ADJ',
                notes: `${reason}: ${notes || 'No notes'}`,
                createdById: session.user.id,
            },
        });

        // Update or create inventory item
        const existingItem = await tx.inventoryItem.findUnique({
            where: {
                productId_warehouseId: {
                    productId,
                    warehouseId,
                },
            },
        });

        if (existingItem) {
            const newQuantity = existingItem.quantityOnHand + movementQuantity;
            await tx.inventoryItem.update({
                where: { id: existingItem.id },
                data: {
                    quantityOnHand: newQuantity,
                    availableQty: newQuantity - existingItem.allocatedQty,
                },
            });
        } else {
            await tx.inventoryItem.create({
                data: {
                    productId,
                    warehouseId,
                    quantityOnHand: movementQuantity,
                    allocatedQty: 0,
                    availableQty: movementQuantity,
                },
            });
        }
    });

    revalidatePath('/adjustments');
    revalidatePath('/dashboard');
    revalidatePath('/inventory');

}

export async function reverseStockAdjustment(adjustmentId: string) {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) throw new Error('Unauthorized');

    await prisma.$transaction(async (tx) => {
        const originalAdjustment = await tx.stockAdjustment.findUnique({
            where: { id: adjustmentId },
        });

        if (!originalAdjustment) throw new Error('Adjustment not found');

        // Create reversal adjustment
        const reversalType = originalAdjustment.adjustmentType === 'increase' ? 'decrease' : 'increase';
        const reversalQuantity = originalAdjustment.quantity;

        await tx.stockAdjustment.create({
            data: {
                productId: originalAdjustment.productId,
                warehouseId: originalAdjustment.warehouseId,
                adjustmentType: reversalType,
                quantity: reversalQuantity,
                reason: 'CORRECTION',
                notes: `Reversal of adjustment ${originalAdjustment.id}`,
                organizationId: session.user.organizationId!,
                createdById: session.user.id,
            },
        });

        // Create reversal movement
        const movementQuantity = reversalType === 'increase' ? reversalQuantity : -reversalQuantity;
        await tx.inventoryMovement.create({
            data: {
                productId: originalAdjustment.productId,
                warehouseId: originalAdjustment.warehouseId,
                movementType: 'ADJUST',
                quantity: movementQuantity,
                referenceType: 'StockAdjustment',
                referenceId: 'ADJ-REV',
                notes: `Reversal of adjustment ${originalAdjustment.id}`,
                createdById: session.user.id,
            },
        });

        // Update inventory
        const existingItem = await tx.inventoryItem.findUnique({
            where: {
                productId_warehouseId: {
                    productId: originalAdjustment.productId,
                    warehouseId: originalAdjustment.warehouseId,
                },
            },
        });

        if (existingItem) {
            const newQuantity = existingItem.quantityOnHand + movementQuantity;
            await tx.inventoryItem.update({
                where: { id: existingItem.id },
                data: {
                    quantityOnHand: newQuantity,
                    availableQty: newQuantity - existingItem.allocatedQty,
                },
            });
        }
    });

    revalidatePath('/adjustments');
    redirect('/adjustments');
}

export async function getStockHistory(productId: string) {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) throw new Error('Unauthorized');

    const movements = await prisma.inventoryMovement.findMany({
        where: {
            productId,
            product: {
                organizationId: session.user.organizationId,
            },
        },
        include: {
            warehouse: true,
            createdBy: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 5,
    });

    return movements;
}
