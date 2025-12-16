import { FastifyInstance } from 'fastify';
import { createOrderHandler } from '../controllers/order.js';

export async function orderRoutes(fastify: FastifyInstance) {
    fastify.addHook('onRequest', fastify.authenticate);
    fastify.post('/', createOrderHandler);
}
