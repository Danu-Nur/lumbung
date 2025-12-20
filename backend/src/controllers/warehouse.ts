import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { MasterService } from '../services/master.js';

const warehouseSchema = z.object({
    name: z.string().min(1),
    code: z.string().min(1),
    address: z.string().optional(),
    city: z.string().optional(),
    phone: z.string().optional(),
    isActive: z.boolean().optional(),
});

export const createWarehouseHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;

        const data = warehouseSchema.parse(req.body);

        // Check unique code
        const existing = await prisma.warehouse.findFirst({
            where: {
                organizationId,
                code: { equals: data.code, mode: 'insensitive' },
                deletedAt: null
            }
        });

        if (existing) return reply.code(409).send({ error: 'Warehouse code already exists' });

        const warehouse = await prisma.warehouse.create({
            data: {
                ...data,
                organizationId
            }
        });

        await MasterService.invalidateMasterCache(organizationId, 'warehouses');

        return reply.code(201).send(warehouse);
    } catch (error) {
        if (error instanceof z.ZodError) return reply.code(400).send({ error: error.errors });
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};

export const updateWarehouseHandler = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;
        const { id } = req.params;

        const data = warehouseSchema.partial().parse(req.body);

        const warehouse = await prisma.warehouse.findFirst({
            where: { id, organizationId, deletedAt: null }
        });

        if (!warehouse) return reply.code(404).send({ error: 'Warehouse not found' });

        if (data.code && data.code !== warehouse.code) {
            const existing = await prisma.warehouse.findFirst({
                where: {
                    organizationId,
                    code: { equals: data.code, mode: 'insensitive' },
                    deletedAt: null,
                    NOT: { id }
                }
            });
            if (existing) return reply.code(409).send({ error: 'Warehouse code taken' });
        }

        const updated = await prisma.warehouse.update({
            where: { id },
            data
        });

        await MasterService.invalidateMasterCache(organizationId, 'warehouses');

        return reply.send(updated);
    } catch (error) {
        if (error instanceof z.ZodError) return reply.code(400).send({ error: error.errors });
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};

export const deleteWarehouseHandler = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;
        const { id } = req.params;

        const warehouse = await prisma.warehouse.findFirst({
            where: { id, organizationId, deletedAt: null }
        });

        if (!warehouse) return reply.code(404).send({ error: 'Warehouse not found' });

        // Check if used in inventory or orders (basic check)
        const inventoryCount = await prisma.inventoryItem.count({
            where: { warehouseId: id, quantityOnHand: { gt: 0 } }
        });
        if (inventoryCount > 0) return reply.code(409).send({ error: 'Warehouse has inventory items' });

        await prisma.warehouse.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        await MasterService.invalidateMasterCache(organizationId, 'warehouses');

        return reply.send({ success: true });
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};
