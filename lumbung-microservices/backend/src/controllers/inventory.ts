import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { InventoryService } from '../services/inventory.js';

const createAdjustmentSchema = z.object({
    productId: z.string(),
    warehouseId: z.string(),
    type: z.enum(['increase', 'decrease']),
    quantity: z.number().int().positive(),
    reason: z.string(),
    notes: z.string().optional(),
});

export async function createAdjustmentHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        if (!req.user) return reply.code(401).send({ error: 'Unauthorized' });

        const data = createAdjustmentSchema.parse(req.body);

        const user = req.user as any;

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

        const user = req.user as any;
        const items = await InventoryService.getInventory(user.organizationId);
        return items;
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}
