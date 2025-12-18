
import { FastifyInstance } from 'fastify';
import { getTestimonialsHandler, getPlansHandler } from '../controllers/marketing.js';

export async function marketingRoutes(fastify: FastifyInstance) {
    // Public route for testimonials
    fastify.get('/marketing/testimonials', getTestimonialsHandler);

    // Public route for pricing plans
    fastify.get('/marketing/plans', getPlansHandler);
}
