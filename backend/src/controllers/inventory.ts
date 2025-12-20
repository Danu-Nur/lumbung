import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { InventoryService } from '../services/inventory.js';

const createAdjustmentSchema = z.object({
    productId: z.string(),
    warehouseId: z.string(),
    type: z.enum(['increase', 'decrease']),
    quantity: z.number().int().positive(),
    reason: z.string(),
    notes: z.string().nullable().optional(),
});

export async function createAdjustmentHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        if (!req.user) return reply.code(401).send({ error: 'Unauthorized' });

        const data = createAdjustmentSchema.parse(req.body);

        const user = req.user as { organizationId: string; id: string };

        const result = await InventoryService.createStockAdjustment({
            ...data,
            organizationId: user.organizationId,
            userId: user.id
        });

        return result;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return reply.code(400).send({ error: error.errors });
        }
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}

export async function getInventoryHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        if (!req.user) return reply.code(401).send({ error: 'Unauthorized' });

        const user = req.user as { organizationId: string };
        const { page = '1', pageSize = '10', q = '' } = req.query as any;

        const result = await InventoryService.getInventory(user.organizationId, {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            q
        });
        return result;
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}

export async function getAdjustmentsHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        if (!req.user) return reply.code(401).send({ error: 'Unauthorized' });

        const user = req.user as { organizationId: string };
        const { page = '1', pageSize = '10', q = '' } = req.query as any;

        const result = await InventoryService.getAdjustments(user.organizationId, {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            q
        });
        return result;
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}

export async function getTransfersHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        if (!req.user) return reply.code(401).send({ error: 'Unauthorized' });

        const user = req.user as { organizationId: string };
        const { page = '1', pageSize = '10', q = '' } = req.query as any;

        const result = await InventoryService.getTransfers(user.organizationId, {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            q
        });
        return result;
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}

export async function getStockOpnamesHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        if (!req.user) return reply.code(401).send({ error: 'Unauthorized' });

        const user = req.user as { organizationId: string };
        const { page = '1', pageSize = '10', q = '' } = req.query as any;

        const result = await InventoryService.getOpnames(user.organizationId, {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            q
        });
        return result;
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}
const createTransferSchema = z.object({
    fromWarehouseId: z.string(),
    toWarehouseId: z.string(),
    notes: z.string().nullable().optional(),
    items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().positive()
    })).min(1),
});

export async function createTransferHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        if (!req.user) return reply.code(401).send({ error: 'Unauthorized' });

        const data = createTransferSchema.parse(req.body);
        const user = req.user as { organizationId: string; id: string };

        const result = await InventoryService.createTransfer({
            ...data,
            organizationId: user.organizationId,
            userId: user.id
        });

        return result;
    } catch (error) {
        if (error instanceof z.ZodError) return reply.code(400).send({ error: error.errors });
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}

const createOpnameSchema = z.object({
    warehouseId: z.string(),
    notes: z.string().nullable().optional(),
    items: z.array(z.object({
        productId: z.string(),
        actualQty: z.number().int().nonnegative()
    })).min(1),
});

export async function createStockOpnameHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        if (!req.user) return reply.code(401).send({ error: 'Unauthorized' });

        const data = createOpnameSchema.parse(req.body);
        const user = req.user as { organizationId: string; id: string };

        const result = await InventoryService.createStockOpname({
            ...data,
            organizationId: user.organizationId,
            userId: user.id
        });

        return result;
    } catch (error) {
        if (error instanceof z.ZodError) return reply.code(400).send({ error: error.errors });
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}

export async function getMovementsHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        if (!req.user) return reply.code(401).send({ error: 'Unauthorized' });

        const user = req.user as { organizationId: string };
        const { productId, warehouseId, type, page = '1', pageSize = '10' } = req.query as any;

        const result = await InventoryService.getMovements(user.organizationId, {
            productId,
            warehouseId,
            type,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        });
        return result;
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}
