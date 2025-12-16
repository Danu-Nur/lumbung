import { FastifyInstance } from 'fastify';
import { createProductHandler, getProductsHandler, updateProductHandler, deleteProductHandler } from '../controllers/product.js';

export async function productRoutes(fastify: FastifyInstance) {
    fastify.addHook('onRequest', fastify.authenticate);
    fastify.get('/', getProductsHandler);
    fastify.post('/', createProductHandler);
    fastify.put('/:id', updateProductHandler);
    fastify.delete('/:id', deleteProductHandler);
}
