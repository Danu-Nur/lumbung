'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MovementType, AdjustmentReason } from "@prisma/client";

// Expected: Warehouse, Product, SKU, Type (Add/Remove), Quantity, Reason, Notes
export async function importAdjustmentBatch(data: any[]): Promise<{ success: boolean; errors?: string[] }> {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return { success: false, errors: ["Unauthorized"] };
    }

    const organizationId = session.user.organizationId;
    const errors: string[] = [];
    let successCount = 0;

    // Normalize keys
    const normalizedData = data.map(item => {
        const newItem: any = {};
        Object.keys(item).forEach(key => {
            newItem[key.trim().toLowerCase()] = item[key];
        });
        return newItem;
    });

    if (normalizedData.length === 0) return { success: true };

    // Pre-fetch
    const warehouses = await prisma.warehouse.findMany({ where: { organizationId } });
    const warehouseMap = new Map(warehouses.map(w => [w.name.toLowerCase(), w.id]));

    const products = await prisma.product.findMany({ where: { organizationId } });
    const productMapByName = new Map(products.map(p => [p.name.toLowerCase(), p.id]));
    const productMapBySku = new Map(products.filter(p => p.sku).map(p => [p.sku.toLowerCase(), p.id]));

    for (const item of normalizedData) {
        const whName = item['warehouse'] ? String(item['warehouse']).toLowerCase() : null;
        if (!whName) continue; // Skip empty rows

        const whId = warehouseMap.get(whName);
        if (!whId) {
            errors.push(`Row ${successCount + errors.length + 1}: Warehouse '${whName}' not found.`);
            continue;
        }

        // Product
        const sku = item['sku'] ? String(item['sku']).toLowerCase() : null;
        const name = item['product name'] || item['product'] || item['name'] ? String(item['product name'] || item['product'] || item['name']).toLowerCase() : null;

        let productId = sku ? productMapBySku.get(sku) : null;
        if (!productId && name) productId = productMapByName.get(name);

        if (!productId) {
            errors.push(`Row ${successCount + errors.length + 1}: Product not found (SKU: ${sku}, Name: ${name}).`);
            continue;
        }

        const quantity = Number(item['quantity']);
        if (isNaN(quantity) || quantity <= 0) {
            errors.push(`Row ${successCount + errors.length + 1}: Invalid Quantity.`);
            continue;
        }

        // Type Mapping
        const rawType = String(item['type'] || 'add').toLowerCase();
        let type: 'increase' | 'decrease' = 'increase';
        if (['decrease', 'remove', 'sub', 'subtract', '-', 'out'].includes(rawType)) type = 'decrease';

        // Reason Mapping
        const rawReason = String(item['reason'] || 'CORRECTION').toUpperCase();
        let reason: AdjustmentReason = AdjustmentReason.CORRECTION; // Default
        if (Object.values(AdjustmentReason).includes(rawReason as AdjustmentReason)) {
            reason = rawReason as AdjustmentReason;
        }

        try {
            await prisma.$transaction(async (tx) => {
                // 1. Create Adjustment
                const adjustment = await tx.stockAdjustment.create({
                    data: {
                        organizationId,
                        warehouseId: whId,
                        productId,
                        adjustmentType: type,
                        quantity,
                        reason,
                        notes: item['notes'] ? String(item['notes']) : undefined,
                        createdById: session.user.id
                    }
                });

                // 2. Update Inventory
                let inventoryItem;
                if (type === 'increase') {
                    inventoryItem = await tx.inventoryItem.upsert({
                        where: { productId_warehouseId: { productId, warehouseId: whId } },
                        create: { productId, warehouseId: whId, quantityOnHand: quantity, availableQty: quantity },
                        update: { quantityOnHand: { increment: quantity }, availableQty: { increment: quantity } }
                    });
                } else {
                    // Decrease
                    inventoryItem = await tx.inventoryItem.update({
                        where: { productId_warehouseId: { productId, warehouseId: whId } },
                        data: { quantityOnHand: { decrement: quantity }, availableQty: { decrement: quantity } }
                    });
                }

                // 3. Movement Log
                await tx.inventoryMovement.create({
                    data: {
                        productId,
                        warehouseId: whId,
                        movementType: MovementType.ADJUST,
                        quantity: type === 'increase' ? quantity : -quantity,
                        referenceType: 'StockAdjustment',
                        referenceId: adjustment.id,
                        notes: reason,
                        createdById: session.user.id
                    }
                });
            });
            successCount++;
        } catch (e: any) {
            console.error(e);
            if (e.code === 'P2025') {
                errors.push(`Row ${successCount + errors.length + 1}: Cannot decrease stock (Item not found in warehouse).`);
            } else {
                errors.push(`Row ${successCount + errors.length + 1}: Failed to save (${e.message}).`);
            }
        }
    }

    revalidatePath('/adjustments');
    revalidatePath('/inventory');

    if (errors.length > 0) {
        return { success: errors.length < normalizedData.length, errors };
    }

    return { success: true };
}
