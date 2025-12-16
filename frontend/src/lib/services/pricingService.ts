import { prisma } from "@/lib/prisma";
import { PriceType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export type UpdatePriceParams = {
    productId: string;
    organizationId: string;
    newPrice: number | Decimal;
    userId: string;
    notes?: string;
};

export const pricingService = {
    /**
     * Updates product selling price and records history
     */
    async updateProductSellingPrice({
        productId,
        organizationId,
        newPrice,
        userId,
        notes,
    }: UpdatePriceParams) {
        return await prisma.$transaction(async (tx) => {
            // Validate product ownership
            const product = await tx.product.findUnique({
                where: { id: productId },
            });

            if (!product || product.organizationId !== organizationId) {
                throw new Error("Product not found or access denied");
            }

            // 1. Create History Record
            await tx.productPriceHistory.create({
                data: {
                    productId,
                    priceType: PriceType.SELLING,
                    price: newPrice,
                    createdById: userId,
                    notes,
                },
            });

            // 2. Update Product Cache
            const updatedProduct = await tx.product.update({
                where: { id: productId },
                data: {
                    sellingPrice: newPrice,
                    updatedById: userId,
                },
            });

            return updatedProduct;
        });
    },

    /**
     * Updates product cost price and records history
     */
    async updateProductCostPrice({
        productId,
        organizationId,
        newPrice,
        userId,
        notes,
    }: UpdatePriceParams) {
        return await prisma.$transaction(async (tx) => {
            // Validate product ownership
            const product = await tx.product.findUnique({
                where: { id: productId },
            });

            if (!product || product.organizationId !== organizationId) {
                throw new Error("Product not found or access denied");
            }

            // 1. Create History Record
            await tx.productPriceHistory.create({
                data: {
                    productId,
                    priceType: PriceType.COST,
                    price: newPrice,
                    createdById: userId,
                    notes,
                },
            });

            // 2. Update Product Cache
            const updatedProduct = await tx.product.update({
                where: { id: productId },
                data: {
                    costPrice: newPrice,
                    updatedById: userId,
                },
            });

            return updatedProduct;
        });
    },

    /**
     * Get latest price from history
     */
    async getLatestProductPriceFromHistory({
        productId,
        priceType,
    }: {
        productId: string;
        priceType: PriceType;
    }) {
        const history = await prisma.productPriceHistory.findFirst({
            where: {
                productId,
                priceType,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return history?.price || null;
    },
};
