import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { SalesOrderService } from '../services/salesOrder.js';

const orderItemSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
});

const createOrderSchema = z.object({
    orderNumber: z.string().optional(),
    customerId: z.string().min(1),
    warehouseId: z.string().min(1),
    items: z.array(orderItemSchema).min(1),
    notes: z.string().optional(),
});

export const getSalesOrdersHandler = async (req: FastifyRequest<{ Querystring: { page?: string; pageSize?: string; q?: string } }>, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string };
        const page = parseInt(req.query.page || '1');
        const pageSize = parseInt(req.query.pageSize || '10');
        const q = req.query.q || '';

        const result = await SalesOrderService.getOrders(user.organizationId, { page, pageSize, q });
        return reply.send(result);
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};

export const createSalesOrderHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string; id: string };
        const data = createOrderSchema.parse(req.body);

        const order = await SalesOrderService.createOrder(data, user.organizationId, user.id);
        return reply.code(201).send(order);
    } catch (error) {
        if (error instanceof z.ZodError) return reply.code(400).send({ error: error.errors });
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
};

export const confirmSalesOrderHandler = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string };
        const order = await SalesOrderService.confirmOrder(req.params.id, user.organizationId);
        return reply.send(order);
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: (error as any).message || 'Internal Server Error' });
    }
};

export const fulfillSalesOrderHandler = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const user = req.user as { organizationId: string; id: string };
        const order = await SalesOrderService.fulfillOrder(req.params.id, user.organizationId, user.id);
        return reply.send(order);
    } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: (error as any).message || 'Internal Server Error' });
    }
};
