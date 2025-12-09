'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Expected columns: Transfer Number (opt), From Warehouse, To Warehouse, Product Name, SKU, Quantity, Notes
export async function importTransferBatch(data: any[]): Promise<{ success: boolean; errors?: string[] }> {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return { success: false, errors: ["Unauthorized"] };
    }

    try {
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

        // Pre-fetch warehouses and products
        const warehouses = await prisma.warehouse.findMany({ where: { organizationId } });
        const warehouseMap = new Map(warehouses.map(w => [w.name.toLowerCase(), w.id]));

        const products = await prisma.product.findMany({ where: { organizationId } });
        // Map Name -> ID and SKU -> ID
        const productMapByName = new Map(products.map(p => [p.name.toLowerCase(), p.id]));
        const productMapBySku = new Map(products.filter(p => p.sku).map(p => [p.sku.toLowerCase(), p.id]));

        // Group by Transfer Number
        // If 'Transfer Number' is missing, treat as unique per row (or auto-group if needed? DANGER. Treat as unique).
        const groups = new Map<string, any[]>();
        let autoGroupIndex = 0;

        for (const item of normalizedData) {
            const transferNo = item['transfer number'] ? String(item['transfer number']).trim() : `AUTO-${Date.now()}-${autoGroupIndex++}`;
            if (!groups.has(transferNo)) {
                groups.set(transferNo, []);
            }
            groups.get(transferNo)?.push(item);
        }

        // Process Groups
        for (const [transferNo, items] of groups) {
            // Get Header Info from First Item
            const firstItem = items[0];
            const fromWhName = firstItem['from warehouse'] ? String(firstItem['from warehouse']).toLowerCase() : null;
            const toWhName = firstItem['to warehouse'] ? String(firstItem['to warehouse']).toLowerCase() : null;
            const notes = firstItem['notes'] ? String(firstItem['notes']) : undefined;

            if (!fromWhName || !toWhName) {
                errors.push(`Transfer '${transferNo}': From/To Warehouse not specified.`);
                continue;
            }

            const fromWhId = warehouseMap.get(fromWhName);
            const toWhId = warehouseMap.get(toWhName);

            if (!fromWhId || !toWhId) {
                errors.push(`Transfer '${transferNo}': Warehouse not found (From: ${fromWhName}, To: ${toWhName}).`);
                continue;
            }

            // Create Header
            try {
                // Collect Items
                const transferItems = [];
                for (const item of items) {
                    // Resolve Product
                    const sku = item['sku'] ? String(item['sku']).toLowerCase() : null;
                    const name = item['product name'] || item['product'] || item['name'] ? String(item['product name'] || item['product'] || item['name']).toLowerCase() : null;

                    let productId = sku ? productMapBySku.get(sku) : null;
                    if (!productId && name) productId = productMapByName.get(name);

                    if (!productId) {
                        errors.push(`Transfer '${transferNo}': Product not found (SKU: ${sku}, Name: ${name}).`);
                        continue; // Skip this item? Or fail transfer?
                        // Let's skip item but error.
                    } else {
                        transferItems.push({
                            productId,
                            quantity: Number(item['quantity']) || 1
                        });
                    }
                }

                if (transferItems.length === 0) {
                    errors.push(`Transfer '${transferNo}': No valid items found.`);
                    continue;
                }

                // Create Transfer (DRAFT)
                // Generate Number ? If 'AUTO-'...
                let finalTransferNumber = transferNo;
                if (transferNo.startsWith('AUTO-')) {
                    // Generate a real Short ID or keep format
                    // Assuming we want a clean number: TRF-TIMESTAMP-RANDOM
                    finalTransferNumber = `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                }

                // Check duplicate Transfer Number if user provided it
                if (!transferNo.startsWith('AUTO-')) {
                    const exists = await prisma.stockTransfer.findUnique({
                        where: { transferNumber: transferNo }
                    });
                    if (exists) {
                        errors.push(`Transfer '${transferNo}': Transfer Number already exists.`);
                        continue;
                    }
                }

                await prisma.stockTransfer.create({
                    data: {
                        organizationId,
                        transferNumber: finalTransferNumber,
                        fromWarehouseId: fromWhId,
                        toWarehouseId: toWhId,
                        status: 'DRAFT', // Safe default
                        notes,
                        createdById: session.user.id,
                        items: {
                            create: transferItems
                        }
                    }
                });

            } catch (e: any) {
                console.error(`Failed to create transfer ${transferNo}`, e);
                errors.push(`Transfer '${transferNo}': ${e.message}`);
            }
        }

        revalidatePath('/transfers');

        if (errors.length > 0) {
            return { success: errors.length < groups.size, errors }; // Partial success if some groups succeeded
        }

        return { success: true };

    } catch (e: any) {
        console.error("Transfer import error", e);
        return { success: false, errors: [e.message] };
    }
}
