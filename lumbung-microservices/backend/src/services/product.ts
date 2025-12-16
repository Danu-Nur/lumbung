import { prisma } from '../lib/prisma.js';

export interface CreateProductData {
    name: string;
    sku: string;
    barcode?: string;
    description?: string;
    categoryId?: string;
    supplierId?: string;
    unit: string;
    sellingPrice: number;
    costPrice: number;
    lowStockThreshold?: number;
    initialStock?: number;
    warehouseId?: string;
    organizationId: string;
    userId: string;
}

export class ProductService {
    static async createProduct(data: CreateProductData) {
        const {
            name, sku, barcode, description, categoryId, supplierId,
            unit, sellingPrice, costPrice, lowStockThreshold,
            initialStock, warehouseId, organizationId, userId
        } = data;

        return await prisma.$transaction(async (tx) => {
            // Check SKU
            const existing = await tx.product.findFirst({
                where: { organizationId, sku, deletedAt: null }
            });
            if (existing) throw new Error('SKU already exists');

            const product = await tx.product.create({
                data: {
                    organizationId,
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
                    createdById: userId,
                }
            });

            // Initial Stock Logic
            if (initialStock && initialStock > 0 && warehouseId) {
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
                        productId: product.id,
                        warehouseId,
                        movementType: 'IN',
                        quantity: initialStock,
                        referenceType: 'InitialStock',
                        referenceId: product.id,
                        notes: 'Initial Stock',
                        createdById: userId,
                    }
                });
            }

            return product;
        });
    }

    static async getProducts(organizationId: string) {
        return await prisma.product.findMany({
            where: { organizationId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
            include: {
                category: true,
                supplier: true,
                inventoryItems: true
            }
        });
    }
}
