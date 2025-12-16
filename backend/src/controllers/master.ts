
import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';

export const getCategoriesHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as { organizationId: string };
        const categories = await prisma.category.findMany({
            where: { organizationId: user.organizationId }
        });
        return reply.send(categories);
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch categories' });
    }
};

export const getWarehousesHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as { organizationId: string };
        const warehouses = await prisma.warehouse.findMany({
            where: { organizationId: user.organizationId }
        });
        return reply.send(warehouses);
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch warehouses' });
    }
};

export const getSuppliersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = request.user as { organizationId: string };
        const suppliers = await prisma.supplier.findMany({
            where: { organizationId: user.organizationId }
        });
        return reply.send(suppliers);
    } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch suppliers' });
    }
};
