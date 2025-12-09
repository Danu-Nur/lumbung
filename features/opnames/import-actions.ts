'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Expected: Opname Number (opt), Warehouse, Product, SKU, Actual Qty, Notes
export async function importOpnameBatch(data: any[]): Promise<{ success: boolean; errors?: string[] }> {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return { success: false, errors: ["Unauthorized"] };
    }

    const organizationId = session.user.organizationId;
    const errors: string[] = [];

    // Normalize keys
    const normalizedData = data.map(item => {
        const newItem: any = {};
        Object.keys(item).forEach(key => {
            newItem[key.trim().toLowerCase()] = item[key];
        });
        return newItem;
    });

    if (normalizedData.length === 0) return { success: true };

    const warehouses = await prisma.warehouse.findMany({ where: { organizationId } });
    const warehouseMap = new Map(warehouses.map(w => [w.name.toLowerCase(), w.id]));

    const products = await prisma.product.findMany({ where: { organizationId } });
    const productMapByName = new Map(products.map(p => [p.name.toLowerCase(), p.id]));
    const productMapBySku = new Map(products.filter(p => p.sku).map(p => [p.sku.toLowerCase(), p.id]));

    // Group by Opname Number OR Warehouse
    // If Opname Number is provided, use it.
    // If NOT provided, group by Warehouse (assuming 1 opname per warehouse in the file).
    const groups = new Map<string, any[]>();

    // Helper to generate key
    let autoGroupIndex = 0;

    for (const item of normalizedData) {
        let key = item['opname number'] ? String(item['opname number']).trim() : null;
        if (!key) {
            const wh = item['warehouse'] ? String(item['warehouse']).toLowerCase() : 'unknown';
            // If no opname number, we group all items for same warehouse into ONE opname?
            // Or create new one per row? Opname usually contains many items.
            // We'll group by Warehouse.
            key = `AUTO-WH-${wh}`;
        }

        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key)?.push(item);
    }

    for (const [groupKey, items] of groups) {
        const firstItem = items[0];
        const whName = firstItem['warehouse'] ? String(firstItem['warehouse']).toLowerCase() : null;
        const notes = firstItem['notes'] ? String(firstItem['notes']) : undefined;

        if (!whName) {
            errors.push(`Group '${groupKey}': Warehouse not designated.`);
            continue;
        }
        const whId = warehouseMap.get(whName);
        if (!whId) {
            errors.push(`Group '${groupKey}': Warehouse '${whName}' not found.`);
            continue;
        }

        // Prepare Opname number
        let opnameNumber = groupKey;
        if (opnameNumber.startsWith('AUTO-')) {
            opnameNumber = `SO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }

        // Validate items & fetch current system qty
        const opnameItems = [];

        // We need current stock for these items.
        // We can fetch individually or bulk.
        // Let's do individually for simplicity now (optimize later if slow).

        for (const item of items) {
            const sku = item['sku'] ? String(item['sku']).toLowerCase() : null;
            const name = item['product name'] || item['product'] || item['name'] ? String(item['product name'] || item['product'] || item['name']).toLowerCase() : null;

            let productId = sku ? productMapBySku.get(sku) : null;
            if (!productId && name) productId = productMapByName.get(name);

            if (!productId) {
                errors.push(`Opname '${opnameNumber}': Product not found (SKU: ${sku}, Name: ${name}).`);
                continue;
            }

            const actualQty = Number(item['actual qty'] || item['actual quantity'] || item['quantity']);
            if (isNaN(actualQty)) {
                errors.push(`Opname '${opnameNumber}': Invalid Actual Qty for product '${name}'.`);
                continue;
            }

            // Get System Qty
            const invItem = await prisma.inventoryItem.findUnique({
                where: { productId_warehouseId: { productId, warehouseId: whId } }
            });
            const systemQty = invItem?.quantityOnHand || 0;
            const difference = actualQty - systemQty;

            opnameItems.push({
                productId,
                systemQty,
                actualQty,
                difference
            });
        }

        if (opnameItems.length === 0) {
            errors.push(`Opname '${opnameNumber}': No valid items to import.`);
            continue;
        }

        try {
            await prisma.stockOpname.create({
                data: {
                    organizationId,
                    opnameNumber,
                    warehouseId: whId,
                    status: 'IN_PROGRESS', // Ready for review/completion
                    notes,
                    createdById: session.user.id,
                    items: {
                        create: opnameItems
                    }
                }
            });
        } catch (e: any) {
            console.error(`Failed to create opname ${opnameNumber}`, e);
            errors.push(`Opname '${opnameNumber}': ${e.message}`);
        }
    }

    revalidatePath('/inventory/opname'); // Adjust path if needed

    if (errors.length > 0) {
        return { success: errors.length < groups.size, errors };
    }

    return { success: true };
}
