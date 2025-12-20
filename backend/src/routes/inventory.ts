import { FastifyInstance } from 'fastify';
import {
    createAdjustmentHandler,
    getInventoryHandler,
    getAdjustmentsHandler,
    getTransfersHandler,
    getStockOpnamesHandler,
    createTransferHandler,
    createStockOpnameHandler
} from '../controllers/inventory.js';

export async function inventoryRoutes(fastify: FastifyInstance) {
    // Protect all routes with JWT verification hook if needed (or check in handler)
    fastify.addHook('onRequest', fastify.authenticate);

    fastify.get('/', getInventoryHandler);
    fastify.get('/adjustments', getAdjustmentsHandler);
    fastify.get('/transfers', getTransfersHandler);
    fastify.get('/opnames', getStockOpnamesHandler);
    fastify.post('/adjustment', createAdjustmentHandler);
    fastify.post('/transfers', createTransferHandler);
    fastify.post('/opnames', createStockOpnameHandler);
}
