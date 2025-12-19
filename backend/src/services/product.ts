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

    static async getProducts(organizationId: string, page = 1, pageSize = 10, search = '') {
        const skip = (page - 1) * pageSize;
        const where: any = {
            organizationId,
            deletedAt: null,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: true,
                    supplier: true,
                    inventoryItems: {
                        include: { warehouse: true }
                    }
                },
                skip,
                take: pageSize,
            }),
            prisma.product.count({ where })
        ]);

        return { products, total };
    }

    static async updateProduct(id: string, organizationId: string, data: Partial<CreateProductData>) {
        // Exclude initialStock from update
        const { initialStock, warehouseId, userId, ...updateData } = data;

        // Check SKU uniqueness if changed
        if (updateData.sku) {
            const existing = await prisma.product.findFirst({
                where: {
                    organizationId,
                    sku: updateData.sku,
                    deletedAt: null,
                    NOT: { id }
                }
            });
            if (existing) throw new Error('SKU already exists');
        }

        return await prisma.product.update({
            where: { id, organizationId },
            data: {
                name: updateData.name,
                sku: updateData.sku,
                barcode: updateData.barcode,
                description: updateData.description,
                categoryId: updateData.categoryId,
                supplierId: updateData.supplierId,
                unit: updateData.unit,
                sellingPrice: updateData.sellingPrice,
                costPrice: updateData.costPrice,
                lowStockThreshold: updateData.lowStockThreshold,
                updatedById: userId
            }
        });
    }

    static async deleteProduct(id: string, organizationId: string, userId: string) {
        // Check if has inventory
        const inventory = await prisma.inventoryItem.findFirst({
            where: { productId: id, quantityOnHand: { gt: 0 } }
        });
        if (inventory) throw new Error('Cannot delete product with existing stock');

        return await prisma.product.update({
            where: { id, organizationId },
            data: {
                deletedAt: new Date(),
                updatedById: userId
            }
        });
    }
}
