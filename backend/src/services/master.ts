import { prisma } from '../lib/prisma.js';
import { cache } from '../lib/cache.js';

export class MasterService {
    static async getCategories(organizationId: string, params: { page?: number; pageSize?: number; q?: string } = {}) {
        const { page = 1, pageSize = 10, q = '' } = params;
        const cacheKey = `tenant:${organizationId}:categories:page:${page}:size:${pageSize}:q:${q}`;

        return await cache.getOrSet(cacheKey, async () => {
            const skip = (page - 1) * pageSize;
            const where: any = { organizationId, deletedAt: null };

            if (q) {
                where.name = { contains: q, mode: 'insensitive' };
            }

            const [categories, total] = await Promise.all([
                prisma.category.findMany({
                    where,
                    skip,
                    take: pageSize,
                    orderBy: { name: 'asc' }
                }),
                prisma.category.count({ where })
            ]);

            return { categories, total };
        });
    }

    static async getWarehouses(organizationId: string, params: { page?: number; pageSize?: number; q?: string } = {}) {
        const { page = 1, pageSize = 10, q = '' } = params;
        const cacheKey = `tenant:${organizationId}:warehouses:page:${page}:size:${pageSize}:q:${q}`;

        return await cache.getOrSet(cacheKey, async () => {
            const skip = (page - 1) * pageSize;
            const where: any = { organizationId, deletedAt: null };

            if (q) {
                where.OR = [
                    { name: { contains: q, mode: 'insensitive' } },
                    { code: { contains: q, mode: 'insensitive' } }
                ];
            }

            const [warehouses, total] = await Promise.all([
                prisma.warehouse.findMany({
                    where,
                    include: {
                        _count: {
                            select: { inventoryItems: true }
                        }
                    },
                    skip,
                    take: pageSize,
                    orderBy: { name: 'asc' }
                }),
                prisma.warehouse.count({ where })
            ]);

            return { warehouses, total };
        });
    }

    static async getSuppliers(organizationId: string, params: { page?: number; pageSize?: number; q?: string } = {}) {
        const { page = 1, pageSize = 10, q = '' } = params;
        const cacheKey = `tenant:${organizationId}:suppliers:page:${page}:size:${pageSize}:q:${q}`;

        return await cache.getOrSet(cacheKey, async () => {
            const skip = (page - 1) * pageSize;
            const where: any = { organizationId, deletedAt: null };

            if (q) {
                where.OR = [
                    { name: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } }
                ];
            }

            const [suppliers, total] = await Promise.all([
                prisma.supplier.findMany({
                    where,
                    skip,
                    take: pageSize,
                    orderBy: { name: 'asc' }
                }),
                prisma.supplier.count({ where })
            ]);

            return { suppliers, total };
        });
    }

    static async getCustomers(organizationId: string, params: { page?: number; pageSize?: number; q?: string } = {}) {
        const { page = 1, pageSize = 10, q = '' } = params;
        const cacheKey = `tenant:${organizationId}:customers:page:${page}:size:${pageSize}:q:${q}`;

        return await cache.getOrSet(cacheKey, async () => {
            const skip = (page - 1) * pageSize;
            const where: any = { organizationId, deletedAt: null };

            if (q) {
                where.OR = [
                    { name: { contains: q, mode: 'insensitive' } },
                    { email: { contains: q, mode: 'insensitive' } }
                ];
            }

            const [customers, total] = await Promise.all([
                prisma.customer.findMany({
                    where,
                    skip,
                    take: pageSize,
                    orderBy: { name: 'asc' }
                }),
                prisma.customer.count({ where })
            ]);

            return { customers, total };
        });
    }

    static async invalidateMasterCache(organizationId: string, type: 'categories' | 'warehouses' | 'suppliers' | 'customers') {
        await cache.invalidatePattern(`tenant:${organizationId}:${type}:*`);
    }
}
