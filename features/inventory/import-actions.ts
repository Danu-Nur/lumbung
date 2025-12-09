'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Expected columns: Name, SKU, Category, Unit, Cost Price, Selling Price, Warehouse, Quantity, Min Stock
export async function importStockBatch(data: any[]): Promise<{ success: boolean; errors?: string[] }> {
    const session = await auth();
    if (!session?.user?.organizationId) {
        return { success: false, errors: ["Unauthorized"] };
    }

    try {
        const errors: string[] = [];
        const organizationId = session.user.organizationId;
        const validItems = [];

        // Cache categories and warehouses to avoid DB calls in loop
        // However, for strict correctness in "millions" scale, we might need to create them on fly?
        // Let's assume for now Categories and Warehouses MUST exist or we fail? 
        // Or we auto-create Category? Auto-creating Category by name is safe.
        // Auto-creating Warehouse is risky.

        // Get all categories and warehouses map
        const categories = await prisma.category.findMany({ where: { organizationId } });
        const warehouses = await prisma.warehouse.findMany({ where: { organizationId } });

        const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
        const warehouseMap = new Map(warehouses.map(w => [w.name.toLowerCase(), w.id]));

        // Normalize keys to support case-insensitive and trimmed headers
        const normalizedData = data.map(item => {
            const newItem: any = {};
            Object.keys(item).forEach(key => {
                newItem[key.trim().toLowerCase()] = item[key];
            });
            return newItem;
        });

        for (const item of normalizedData) {
            const name = item['name']; // Normalized key
            const sku = item['sku'];

            if (!name) continue;

            const categoryName = item['category'] ? String(item['category']).toLowerCase() : null;
            let categoryId = categoryName ? categoryMap.get(categoryName) : null;

            const warehouseName = item['warehouse'] ? String(item['warehouse']).toLowerCase() : null;
            let warehouseId = warehouseName ? warehouseMap.get(warehouseName) : null;

            // Prepare Product Data
            validItems.push({
                name: String(name),
                sku: sku ? String(sku) : undefined,
                categoryId,
                unit: item['unit'] || 'pcs',
                costPrice: Number(item['cost price']) || 0,
                sellingPrice: Number(item['selling price']) || 0,
                warehouseId,
                quantity: Number(item['quantity']) || 0,
                minStock: Number(item['min stock']) || 0,
                barcode: item['barcode'] ? String(item['barcode']) : undefined,
                description: item['description'] ? String(item['description']) : undefined,
            });
        }

        if (validItems.length === 0 && data.length > 0) {
            return { success: false, errors: ["No valid items found. Please check column headers (Name, SKU, etc)."] };
        }

        if (validItems.length === 0 && data.length > 0) {
            return { success: false, errors: ["No valid items found. Please check column headers (Name, SKU, etc)."] };
        }

        if (validItems.length === 0) return { success: true };

        const importErrors: string[] = [];

        for (const item of validItems) {
            let productId = null;

            // Find or Create Product
            try {
                // Try by SKU first
                if (item.sku) {
                    const existing = await prisma.product.findFirst({
                        where: { organizationId, sku: item.sku }
                    });
                    if (existing) productId = existing.id;
                }

                // Try by Name if no SKU or not found
                if (!productId) {
                    const existingByName = await prisma.product.findFirst({
                        where: { organizationId, name: item.name }
                    });
                    if (existingByName) productId = existingByName.id;
                }

                if (!productId) {
                    const newProduct = await prisma.product.create({
                        data: {
                            organization: { connect: { id: organizationId } },
                            name: item.name,
                            sku: item.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                            category: item.categoryId ? { connect: { id: item.categoryId } } : undefined,
                            createdBy: { connect: { id: session.user.id } }, // Required field
                            unit: item.unit,
                            costPrice: item.costPrice,
                            sellingPrice: item.sellingPrice,
                            lowStockThreshold: item.minStock,
                            barcode: item.barcode,
                            description: item.description,
                        }
                    });
                    productId = newProduct.id;
                }
            } catch (e: any) {
                console.error("Failed to create product", item.name, e);
                let errorMessage = e.message;
                if (e.message.includes("Unique constraint")) {
                    errorMessage = "Name or SKU already exists.";
                } else if (e.message.includes("Argument")) {
                    errorMessage = "Invalid data format (missing required fields).";
                } else {
                    // Try to capture the last meaningful line to avoid stack trace
                    const lines = e.message.split('\n');
                    errorMessage = lines.length > 0 ? lines[lines.length - 1] : "Unknown database error";
                }
                importErrors.push(`Failed to create product '${item.name}': ${errorMessage}`);
                continue;
            }

            // Update Inventory if Warehouse Provided
            if (item.warehouseId && productId) {
                try {
                    await prisma.inventoryItem.upsert({
                        where: {
                            productId_warehouseId: {
                                productId,
                                warehouseId: item.warehouseId
                            }
                        },
                        create: {
                            productId,
                            warehouseId: item.warehouseId,
                            quantityOnHand: item.quantity,
                            availableQty: item.quantity,
                        },
                        update: {
                            quantityOnHand: item.quantity,
                            availableQty: item.quantity,
                        }
                    });
                } catch (e: any) {
                    importErrors.push(`Failed to update stock for '${item.name}': ${e.message}`);
                }
            } else if (item.quantity > 0 && !item.warehouseId) {
                // Warn if quantity provided but no valid warehouse
                importErrors.push(`Skipped stock for '${item.name}': Warehouse not specified or not found.`);
            }
        }

        revalidatePath('/inventory');

        if (importErrors.length > 0) {
            // If we have some errors, return partial success
            return { success: importErrors.length < validItems.length, errors: importErrors };
        }

        return { success: true };

    } catch (error: any) {
        console.error("Stock import error:", error);
        return { success: false, errors: ["Stock import failed: " + error.message] };
    }
}
