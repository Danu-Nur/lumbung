import { FastifyInstance } from 'fastify';
import { createAdjustmentHandler, getInventoryHandler } from '../controllers/inventory.js';

export async function inventoryRoutes(fastify: FastifyInstance) {
    // Protect all routes with JWT verification hook if needed (or check in handler)
    fastify.addHook('onRequest', fastify.authenticate);

    fastify.get('/', getInventoryHandler);
    fastify.post('/adjustment', createAdjustmentHandler);
}
