import { prisma } from "@/lib/prisma";

export const productService = {
    /**
     * Create a new product
     */
    async createProduct({
        organizationId,
        name,
        sku,
        barcode,
        description,
        categoryId,
        unit,
        sellingPrice,
        costPrice,
        lowStockThreshold,
        createdById,
    }: {
        organizationId: string;
        name: string;
        sku: string;
        barcode?: string | null;
        description?: string | null;
        categoryId?: string | null;
        unit: string;
        sellingPrice: number;
        costPrice: number;
        lowStockThreshold?: number;
        createdById: string;
    }) {
        // Check if SKU already exists
        const existing = await prisma.product.findFirst({
            where: {
                organizationId,
                sku,
                deletedAt: null,
            },
        });

        if (existing) {
            throw new Error('SKU already exists');
        }

        return await prisma.product.create({
            data: {
                organizationId,
                name,
                sku,
                barcode,
                description,
                categoryId,
                unit,
                sellingPrice,
                costPrice,
                lowStockThreshold: lowStockThreshold || 10,
                createdById,
            },
        });
    },

    /**
     * Update a product
     */
    async updateProduct({
        id,
        organizationId,
        data,
        updatedById,
    }: {
        id: string;
        organizationId: string;
        data: {
            name?: string;
            sku?: string;
            barcode?: string | null;
            description?: string | null;
            categoryId?: string | null;
            unit?: string;
            sellingPrice?: number;
            costPrice?: number;
            lowStockThreshold?: number;
        };
        updatedById: string;
    }) {
        const product = await prisma.product.findFirst({
            where: {
                id,
                organizationId,
                deletedAt: null,
            },
        });

        if (!product) {
            throw new Error('Product not found');
        }

        return await prisma.product.update({
            where: { id },
            data: {
                ...data,
                updatedById,
            },
        });
    },

    /**
     * Soft delete a product
     */
    async deleteProduct({
        id,
        organizationId,
        updatedById,
    }: {
        id: string;
        organizationId: string;
        updatedById: string;
    }) {
        const product = await prisma.product.findFirst({
            where: {
                id,
                organizationId,
                deletedAt: null,
            },
        });

        if (!product) {
            throw new Error('Product not found');
        }

        // Soft delete with SKU rename to allow reuse
        return await prisma.product.update({
            where: { id },
            data: {
                sku: `${product.sku}_deleted_${Date.now()}`,
                deletedAt: new Date(),
                updatedById,
            },
        });
    },

    /**
     * Sets the default supplier for a product.
     */
    async setProductDefaultSupplier({
        productId,
        supplierId,
        organizationId,
    }: {
        productId: string;
        supplierId: string;
        organizationId: string;
    }) {
        // Validate product and supplier belong to the same organization
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { organizationId: true },
        });

        if (!product || product.organizationId !== organizationId) {
            throw new Error("Product not found or access denied");
        }

        const supplier = await prisma.supplier.findUnique({
            where: { id: supplierId },
            select: { organizationId: true },
        });

        if (!supplier || supplier.organizationId !== organizationId) {
            throw new Error("Supplier not found or access denied");
        }

        return await prisma.product.update({
            where: { id: productId },
            data: { supplierId },
        });
    },

    /**
     * Clears the default supplier for a product.
     */
    async clearProductDefaultSupplier({
        productId,
        organizationId,
    }: {
        productId: string;
        organizationId: string;
    }) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { organizationId: true },
        });

        if (!product || product.organizationId !== organizationId) {
            throw new Error("Product not found or access denied");
        }

        return await prisma.product.update({
            where: { id: productId },
            data: { supplierId: null },
        });
    },
};
