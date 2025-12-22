import { prisma } from '../lib/prisma.js';
import { cache } from '../lib/cache.js';
import { serializeData } from '../lib/serialize.js';

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

        const result = await prisma.$transaction(async (tx) => {
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
                    supplierId: supplierId || null,  // Cache: preferred supplier
                    unit,
                    sellingPrice,  // Cache: will be synced with ProductPriceHistory
                    costPrice,     // Cache: will be synced with InventoryItem avg
                    lowStockThreshold: lowStockThreshold || 10,
                    createdById: userId,
                }
            });

            // Create initial selling price history
            await tx.productPriceHistory.create({
                data: {
                    productId: product.id,
                    priceType: 'SELLING',
                    price: sellingPrice,
                    currency: 'IDR',
                    effectiveAt: new Date(),
                    notes: 'Initial selling price',
                    createdById: userId
                }
            });

            // Initial Stock Logic
            // Always create inventory item if warehouse is selected (even with 0 stock)
            // This ensures supplier relationship is tracked from the start
            if (warehouseId) {
                await tx.inventoryItem.create({
                    data: {
                        productId: product.id,
                        warehouseId,
                        supplierId: supplierId || null,  // Set supplier for this batch
                        unitCost: costPrice,              // Set cost for this batch
                        quantityOnHand: initialStock || 0,  // Allow 0 stock
                        availableQty: initialStock || 0,
                        allocatedQty: 0,
                        batchNumber: `INIT-${product.sku}`,
                        receivedDate: new Date()
                    }
                });

                // Only create movement if there's actual stock
                if (initialStock && initialStock > 0) {
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
            }

            return product;
        });

        // Invalidate stats and products cache
        await cache.invalidate(`tenant:${organizationId}:inventory:stats`);
        await cache.invalidatePattern(`tenant:${organizationId}:products:*`);

        return result;
    }

    static async getProducts(organizationId: string, page = 1, pageSize = 10, search = '') {
        const cacheKey = `tenant:${organizationId}:products:page:${page}:size:${pageSize}:q:${search}`;

        return await cache.getOrSet(cacheKey, async () => {
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
                            include: {
                                warehouse: true,
                                supplier: true
                            }
                        }
                    },
                    skip,
                    take: pageSize,
                }),
                prisma.product.count({ where })
            ]);

            return { products: serializeData(products), total };
        }, 60); // 60 seconds TTL
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

        const updated = await prisma.product.update({
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
            },
            include: {
                category: true,
                supplier: true,
                inventoryItems: {
                    include: {
                        warehouse: true,
                        supplier: true
                    }
                }
            }
        });

        // Invalidate stats and products cache
        await cache.invalidate(`tenant:${organizationId}:inventory:stats`);
        await cache.invalidatePattern(`tenant:${organizationId}:products:*`);

        return updated;
    }

    static async deleteProduct(id: string, organizationId: string, userId: string) {
        // Check if has inventory
        const inventory = await prisma.inventoryItem.findFirst({
            where: { productId: id, quantityOnHand: { gt: 0 } }
        });
        if (inventory) throw new Error('Cannot delete product with existing stock');

        const deleted = await prisma.product.update({
            where: { id, organizationId },
            data: {
                deletedAt: new Date(),
                updatedById: userId
            }
        });

        // Invalidate stats and products cache
        await cache.invalidate(`tenant:${organizationId}:inventory:stats`);
        await cache.invalidatePattern(`tenant:${organizationId}:products:*`);

        return deleted;
    }

    /**
     * Update product selling price
     * Creates new price history entry and updates cache
     */
    static async updateSellingPrice(
        productId: string,
        organizationId: string,
        newPrice: number,
        userId: string,
        notes?: string
    ) {
        const result = await prisma.$transaction(async (tx) => {
            // Verify product exists and belongs to organization
            const product = await tx.product.findFirst({
                where: { id: productId, organizationId, deletedAt: null }
            });
            if (!product) throw new Error('Product not found');

            // Create price history
            await tx.productPriceHistory.create({
                data: {
                    productId,
                    priceType: 'SELLING',
                    price: newPrice,
                    currency: 'IDR',
                    effectiveAt: new Date(),
                    notes: notes || 'Price update',
                    createdById: userId
                }
            });

            // Update cached selling price
            const updated = await tx.product.update({
                where: { id: productId },
                data: {
                    sellingPrice: newPrice,
                    updatedById: userId
                }
            });

            return updated;
        });

        // Invalidate cache
        await cache.invalidatePattern(`tenant:${organizationId}:products:*`);

        return result;
    }

    /**
     * Calculate and update weighted average cost from inventory items
     * Should be called after receiving new stock
     */
    static async updateAverageCost(productId: string, organizationId: string) {
        const result = await prisma.$transaction(async (tx) => {
            // Get all inventory items with stock
            const items = await tx.inventoryItem.findMany({
                where: {
                    productId,
                    quantityOnHand: { gt: 0 }
                }
            });

            if (items.length === 0) {
                // No stock, keep current cost
                return null;
            }

            // Calculate weighted average: sum(qty * cost) / sum(qty)
            const totalValue = items.reduce(
                (sum, item) => sum + (item.quantityOnHand * Number(item.unitCost)),
                0
            );
            const totalQty = items.reduce((sum, item) => sum + item.quantityOnHand, 0);
            const avgCost = totalValue / totalQty;

            // Update cached cost price
            const updated = await tx.product.update({
                where: { id: productId, organizationId },
                data: { costPrice: avgCost }
            });

            return updated;
        });

        if (result) {
            await cache.invalidatePattern(`tenant:${organizationId}:products:*`);
        }

        return result;
    }

    /**
     * Get current selling price from history
     * Fallback to cached price if no history found
     */
    static async getCurrentSellingPrice(productId: string): Promise<number> {
        const priceHistory = await prisma.productPriceHistory.findFirst({
            where: {
                productId,
                priceType: 'SELLING',
                effectiveAt: { lte: new Date() }
            },
            orderBy: { effectiveAt: 'desc' }
        });

        if (priceHistory) {
            return Number(priceHistory.price);
        }

        // Fallback to cached price
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        return product ? Number(product.sellingPrice) : 0;
    }

    /**
     * Get price history for a product
     */
    static async getPriceHistory(productId: string, priceType?: 'SELLING' | 'COST') {
        return prisma.productPriceHistory.findMany({
            where: {
                productId,
                ...(priceType && { priceType })
            },
            orderBy: { effectiveAt: 'desc' },
            include: {
                createdBy: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
    }
}
