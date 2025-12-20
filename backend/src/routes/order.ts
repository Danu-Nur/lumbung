import { FastifyInstance } from 'fastify';
import { createSalesOrderHandler, getSalesOrdersHandler, confirmSalesOrderHandler, fulfillSalesOrderHandler } from '../controllers/salesOrder.js';

export async function orderRoutes(fastify: FastifyInstance) {
    fastify.addHook('onRequest', fastify.authenticate);
    fastify.get('/', getSalesOrdersHandler);
    fastify.post('/', createSalesOrderHandler);
    fastify.post('/:id/confirm', confirmSalesOrderHandler);
    fastify.post('/:id/fulfill', fulfillSalesOrderHandler);
}
