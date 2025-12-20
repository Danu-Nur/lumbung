import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { PurchaseOrderService } from '../services/purchaseOrder.js';

const poItemSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().min(1),
    unitCost: z.number().min(0),
});

const createPOSchema = z.object({
    poNumber: z.string().optional(),
    supplierId: z.string().min(1),
    warehouseId: z.string().min(1),
    items: z.array(poItemSchema).min(1),
    notes: z.string().optional(),
});

export const getPurchaseOrdersHandler = async (req: FastifyRequest<{ Querystring: { page?: string; pageSize?: string; q?: string } }>, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string };
        const page = parseInt(req.query.page || '1');
        const pageSize = parseInt(req.query.pageSize || '10');
        const q = req.query.q || '';

        const result = await PurchaseOrderService.getOrders(user.organizationId, { page, pageSize, q });
        return reply.send(result);
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};

export const createPurchaseOrderHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string; id: string };
        const data = createPOSchema.parse(req.body);

        const order = await PurchaseOrderService.createOrder(data, user.organizationId, user.id);
        return reply.code(201).send(order);
    } catch (error) {
        if (error instanceof z.ZodError) return reply.code(400).send({ error: error.errors });
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};

export const completePurchaseOrderHandler = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string; id: string };
        const order = await PurchaseOrderService.completeOrder(req.params.id, user.organizationId, user.id);
        return reply.send(order);
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: (error as any).message || 'Internal Server Error' });
    }
};
