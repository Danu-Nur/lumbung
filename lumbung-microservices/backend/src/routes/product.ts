import { FastifyInstance } from 'fastify';
import { createProductHandler, getProductsHandler } from '../controllers/product.js';

export async function productRoutes(fastify: FastifyInstance) {
    fastify.get('/', getProductsHandler);
    fastify.post('/', createProductHandler);
}
