
import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';


export const getCategoriesHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as { organizationId: string };
        const { page = '1', pageSize = '10', q = '' } = request.query as any;
        const skip = (Number(page) - 1) * Number(pageSize);
        const take = Number(pageSize);

        const where: any = {
            organizationId: user.organizationId,
            deletedAt: null
        };

        if (q) {
            where.name = { contains: q, mode: 'insensitive' };
        }

        const [categories, total] = await Promise.all([
            prisma.category.findMany({
                where,
                skip,
                take,
                orderBy: { name: 'asc' }
            }),
            prisma.category.count({ where })
        ]);

        return reply.send({ categories, total });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch categories' });
    }
};

export const getWarehousesHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as { organizationId: string };
        const { page = '1', pageSize = '10', q = '' } = request.query as any;
        const skip = (Number(page) - 1) * Number(pageSize);
        const take = Number(pageSize);

        const where: any = {
            organizationId: user.organizationId,
            deletedAt: null
        };

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
                take,
                orderBy: { name: 'asc' }
            }),
            prisma.warehouse.count({ where })
        ]);

        return reply.send({ warehouses, total });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch warehouses' });
    }
};

export const getSuppliersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as { organizationId: string };
        const { page = '1', pageSize = '10', q = '' } = request.query as any;
        const skip = (Number(page) - 1) * Number(pageSize);
        const take = Number(pageSize);

        const where: any = {
            organizationId: user.organizationId,
            deletedAt: null
        };

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
                take,
                orderBy: { name: 'asc' }
            }),
            prisma.supplier.count({ where })
        ]);

        return reply.send({ suppliers, total });
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch suppliers' });
    }
};
