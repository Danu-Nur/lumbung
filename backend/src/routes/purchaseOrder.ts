import { FastifyInstance } from 'fastify';
import { getPurchaseOrdersHandler, createPurchaseOrderHandler, completePurchaseOrderHandler } from '../controllers/purchaseOrder.js';

export async function purchaseOrderRoutes(fastify: FastifyInstance) {
    fastify.addHook('onRequest', fastify.authenticate);
    fastify.get('/', getPurchaseOrdersHandler);
    fastify.post('/', createPurchaseOrderHandler);
    fastify.post('/:id/complete', completePurchaseOrderHandler);
}
