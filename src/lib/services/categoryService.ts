import { prisma } from "@/lib/prisma";
import { CreateCategoryParams, UpdateCategoryParams } from "@/types/domain";

export const categoryService = {
    async listCategories({
        organizationId,
        search,
        page = 1,
        pageSize = 10,
    }: {
        organizationId: string;
        search?: string;
        page?: number;
        pageSize?: number;
    }) {
        const skip = (page - 1) * pageSize;
        const where = {
            organizationId,
            deletedAt: null,
            ...(search
                ? {
                    OR: [
                        { name: { contains: search, mode: "insensitive" as const } },
                        { description: { contains: search, mode: "insensitive" as const } },
                    ],
                }
                : {}),
        };

        const [data, total] = await Promise.all([
            prisma.category.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { name: "asc" },
            }),
            prisma.category.count({ where }),
        ]);

        return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    },

    async getCategoryById({ id, organizationId }: { id: string; organizationId: string }) {
        return await prisma.category.findFirst({
            where: {
                id,
                organizationId,
                deletedAt: null,
            },
        });
    },

    async createCategory({ organizationId, name, description }: CreateCategoryParams) {
        // Enforce uniqueness of name per organization
        const existing = await prisma.category.findFirst({
            where: {
                organizationId,
                name: { equals: name, mode: "insensitive" }, // Case insensitive check
                deletedAt: null,
            },
        });

        if (existing) {
            throw new Error("Category with this name already exists in your organization");
        }

        return await prisma.category.create({
            data: {
                organizationId,
                name,
                description,
            },
        });
    },

    async updateCategory({ id, organizationId, name, description }: UpdateCategoryParams) {
        const category = await prisma.category.findFirst({
            where: { id, organizationId, deletedAt: null },
        });

        if (!category) {
            throw new Error("Category not found");
        }

        if (name && name !== category.name) {
            const existing = await prisma.category.findFirst({
                where: {
                    organizationId,
                    name: { equals: name, mode: "insensitive" },
                    deletedAt: null,
                    NOT: { id },
                },
            });

            if (existing) {
                throw new Error("Category with this name already exists");
            }
        }

        return await prisma.category.update({
            where: { id },
            data: {
                name,
                description,
            },
        });
    },

    async deleteCategory({
        id,
        organizationId,
        softDelete = true,
        forceDelete = false,
    }: {
        id: string;
        organizationId: string;
        softDelete?: boolean;
        forceDelete?: boolean;
    }) {
        const category = await prisma.category.findFirst({
            where: { id, organizationId, deletedAt: null },
        });

        if (!category) {
            throw new Error("Category not found");
        }

        // Check for attached products
        const productCount = await prisma.product.count({
            where: { categoryId: id },
        });

        if (productCount > 0) {
            if (!forceDelete) {
                throw new Error(`Cannot delete category with ${productCount} assigned products. Use forceDelete to proceed (products will be unassigned).`);
            }

            // Force delete: Unassign products first
            await prisma.product.updateMany({
                where: { categoryId: id },
                data: { categoryId: null },
            });
        }

        if (softDelete) {
            return await prisma.category.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        } else {
            return await prisma.category.delete({
                where: { id },
            });
        }
    },
};
