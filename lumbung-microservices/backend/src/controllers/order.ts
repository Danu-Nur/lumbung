import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { OrderService } from '../services/order.js';

const createOrderSchema = z.object({
    orderNumber: z.string().min(1),
    customerId: z.string().optional(),
    items: z.array(z.object({
        productId: z.string().min(1),
        quantity: z.number().min(1),
        price: z.number().min(0),
    })).min(1),
});

export async function createOrderHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        if (!req.user) return reply.code(401).send({ error: 'Unauthorized' });

        const data = createOrderSchema.parse(req.body);

        const user = req.user as any;

        const order = await OrderService.createOrder({
            ...data,
            organizationId: user.organizationId,
            userId: user.id
        });

        return order;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return reply.code(400).send({ error: error.errors });
        }
        req.log.error(error);
        return reply.code(500).send({ error: 'Internal Server Error' });
    }
}
