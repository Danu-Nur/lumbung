import { prisma } from "@/lib/prisma";
import { CreateSupplierParams, UpdateSupplierParams } from "@/types/domain";

export const supplierService = {
    async createSupplier({
        organizationId,
        name,
        email,
        phone,
        address,
        city,
        taxId,
        notes,
    }: CreateSupplierParams) {
        // Check uniqueness
        const existing = await prisma.supplier.findFirst({
            where: {
                organizationId,
                name: { equals: name, mode: 'insensitive' },
                deletedAt: null,
            },
        });

        if (existing) {
            throw new Error('Supplier with this name already exists');
        }

        return await prisma.supplier.create({
            data: {
                organizationId,
                name,
                email,
                phone,
                address,
                city,
                taxId,
                notes,
            },
        });
    },

    async updateSupplier({ id, organizationId, data }: UpdateSupplierParams) {
        const supplier = await prisma.supplier.findFirst({
            where: { id, organizationId, deletedAt: null },
        });

        if (!supplier) {
            throw new Error('Supplier not found');
        }

        if (data.name && data.name !== supplier.name) {
            const existing = await prisma.supplier.findFirst({
                where: {
                    organizationId,
                    name: { equals: data.name, mode: 'insensitive' },
                    deletedAt: null,
                    NOT: { id },
                },
            });

            if (existing) {
                throw new Error('Supplier with this name already exists');
            }
        }

        return await prisma.supplier.update({
            where: { id },
            data,
        });
    },

    async deleteSupplier({ id, organizationId }: { id: string; organizationId: string }) {
        const supplier = await prisma.supplier.findFirst({
            where: { id, organizationId, deletedAt: null },
        });

        if (!supplier) {
            throw new Error('Supplier not found');
        }

        // Check for attached products
        const productsCount = await prisma.product.count({
            where: { supplierId: id, deletedAt: null },
        });

        if (productsCount > 0) {
            throw new Error(`Cannot delete supplier. It is assigned to ${productsCount} products.`);
        }

        // Check for purchase orders
        const poCount = await prisma.purchaseOrder.count({
            where: { supplierId: id },
        });

        if (poCount > 0) {
            throw new Error(`Cannot delete supplier. They have ${poCount} purchase orders.`);
        }

        return await prisma.supplier.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    },

    async listSuppliers({
        organizationId,
        page = 1,
        pageSize = 10,
        search = '',
    }: {
        organizationId: string;
        page?: number;
        pageSize?: number;
        search?: string;
    }) {
        const skip = (page - 1) * pageSize;
        const where = {
            organizationId,
            deletedAt: null,
            OR: search
                ? [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                    { phone: { contains: search, mode: 'insensitive' as const } },
                ]
                : undefined,
        };

        const [suppliers, total] = await prisma.$transaction([
            prisma.supplier.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            prisma.supplier.count({ where }),
        ]);

        return {
            suppliers,
            total,
            totalPages: Math.ceil(total / pageSize),
        };
    },
};
