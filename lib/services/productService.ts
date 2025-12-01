import { prisma } from "@/lib/prisma";

export const productService = {
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
