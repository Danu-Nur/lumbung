'use server';

import { auth } from '@/lib/auth';
import { productService } from '@/lib/services/productService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function createProduct(formData: FormData) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const name = formData.get('name') as string;
    const sku = formData.get('sku') as string;
    const barcode = formData.get('barcode') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const unit = formData.get('unit') as string;
    const sellingPrice = parseFloat(formData.get('sellingPrice') as string);
    const costPrice = parseFloat(formData.get('costPrice') as string);
    const lowStockThreshold = parseInt(formData.get('lowStockThreshold') as string);
    const initialStock = parseFloat(formData.get('initialStock') as string) || 0;
    const warehouseId = formData.get('warehouseId') as string;
    const supplierId = formData.get('supplierId') as string;

    // Validate
    if (!name || !sku || !unit || isNaN(sellingPrice) || isNaN(costPrice)) {
        throw new Error('Missing required fields');
    }

    // Transaction for product creation and initial stock
    await prisma.$transaction(async (tx) => {
        // Check SKU overlap
        const existing = await tx.product.findFirst({
            where: { organizationId: session.user.organizationId!, sku, deletedAt: null }
        });
        if (existing) throw new Error('SKU already exists');

        const product = await tx.product.create({
            data: {
                organizationId: session.user.organizationId!,
                name,
                sku,
                barcode: barcode || null,
                description: description || null,
                categoryId: categoryId || null,
                supplierId: supplierId || null,
                unit,
                sellingPrice,
                costPrice,
                lowStockThreshold: lowStockThreshold || 10,
                createdById: session.user.id,
            }
        });

        // Add Initial Stock if provided
        if (initialStock > 0 && warehouseId) {
            await tx.inventoryItem.create({
                data: {
                    productId: product.id,
                    warehouseId,
                    quantityOnHand: initialStock,
                    availableQty: initialStock,
                    allocatedQty: 0
                }
            });

            await tx.inventoryMovement.create({
                data: {

                    // Wait, actions.ts createStockAdjustment uses inventoryMovement.create WITHOUT organizationId in my view? 
                    // Let's check view of createStockAdjustment in step 2136.
                    // It has: data: { productId, warehouseId, movementType, ... createdById }
                    // It implicitly has relation? No.
                    // The InventoryMovement model usually links to Warehouse or Product which has OrgId.
                    // I will follow the pattern in createStockAdjustment.
                    productId: product.id,
                    warehouseId,
                    movementType: 'IN', // 'IN' for initial stock? or 'ADJUST' ? usually 'IN' for purchase/initial.
                    quantity: initialStock,
                    referenceType: 'InitialStock',
                    referenceId: product.id, // Reference self? Or null?
                    notes: 'Initial Stock',
                    createdById: session.user.id,
                }
            });
        }
    });

    revalidatePath('/inventory');
}

export async function updateProduct(productId: string, formData: FormData) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const name = formData.get('name') as string;
    const sku = formData.get('sku') as string;
    const barcode = formData.get('barcode') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const supplierId = formData.get('supplierId') as string;
    const unit = formData.get('unit') as string;
    const sellingPrice = parseFloat(formData.get('sellingPrice') as string);
    const costPrice = parseFloat(formData.get('costPrice') as string);
    const lowStockThreshold = parseInt(formData.get('lowStockThreshold') as string);

    await productService.updateProduct({
        id: productId,
        organizationId: session.user.organizationId,
        data: {
            name,
            sku,
            barcode: barcode || null,
            description: description || null,
            categoryId: categoryId || null,
            supplierId: supplierId || null,
            unit,
            sellingPrice,
            costPrice,
            lowStockThreshold: lowStockThreshold || 10,
        },
        updatedById: session.user.id,
    });

    revalidatePath('/inventory');
}

export async function deleteProduct(productId: string) {
    const session = await auth();

    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    await productService.deleteProduct({
        id: productId,
        organizationId: session.user.organizationId,
        updatedById: session.user.id,
    });

    revalidatePath('/inventory');
}

export async function getProductHistory(productId: string) {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const [priceHistory, movements] = await Promise.all([
        prisma.productPriceHistory.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { createdBy: true }
        }),
        prisma.inventoryMovement.findMany({
            where: { productId },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                warehouse: true,
            }
        })
    ]);

    return { priceHistory, movements };
}

export async function createStockAdjustment(data: {
    productId: string;
    warehouseId: string;
    type: 'increase' | 'decrease';
    quantity: number;
    reason: string;
    notes?: string;
}) {
    const session = await auth();
    if (!session?.user || !session.user.organizationId) {
        throw new Error('Unauthorized');
    }

    const { productId, warehouseId, type, quantity, reason, notes } = data;

    // Use a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
        // 1. Create Stock Adjustment record
        const adjustment = await tx.stockAdjustment.create({
            data: {
                productId,
                warehouseId,
                adjustmentType: type,
                quantity,
                reason: reason as any, // Cast to enum if needed, or ensure type matches
                notes,
                organizationId: session.user.organizationId!,
                createdById: session.user.id,
            }
        });

        // 2. Create Inventory Movement
        await tx.inventoryMovement.create({
            data: {
                productId,
                warehouseId,
                movementType: 'ADJUST',
                quantity: type === 'increase' ? quantity : -quantity,
                referenceType: 'StockAdjustment',
                referenceId: adjustment.id,
                notes,
                createdById: session.user.id,
            }
        });

        // 3. Update Inventory Item
        const inventoryItem = await tx.inventoryItem.findUnique({
            where: {
                productId_warehouseId: {
                    productId,
                    warehouseId
                }
            }
        });

        if (inventoryItem) {
            await tx.inventoryItem.update({
                where: { id: inventoryItem.id },
                data: {
                    quantityOnHand: {
                        increment: type === 'increase' ? quantity : -quantity
                    },
                    availableQty: {
                        increment: type === 'increase' ? quantity : -quantity
                    }
                }
            });
        } else {
            // Create new inventory item if it doesn't exist
            if (type === 'decrease') {
                throw new Error('Cannot decrease stock for non-existent inventory item');
            }
            await tx.inventoryItem.create({
                data: {
                    productId,
                    warehouseId,
                    quantityOnHand: quantity,
                    availableQty: quantity,
                    allocatedQty: 0
                }
            });
        }
    });

    revalidatePath('/inventory');
}


export async function createStockAdjustmentFromForm(formData: FormData) {
    const productId = formData.get('productId') as string;
    const warehouseId = formData.get('warehouseId') as string;
    const type = formData.get('adjustmentType') as 'increase' | 'decrease';
    const quantity = parseInt(formData.get('quantity') as string);
    const reason = formData.get('reason') as string;
    const notes = formData.get('notes') as string;

    if (!productId || !warehouseId || !type || !quantity || !reason) {
        throw new Error('Missing required fields');
    }

    await createStockAdjustment({
        productId,
        warehouseId,
        type,
        quantity,
        reason,
        notes,
    });

    redirect('/adjustments');
}
