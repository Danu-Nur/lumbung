import { FastifyInstance } from 'fastify';
import { getPlansHandler, getSubscriptionHandler } from '../controllers/subscription.js';

export async function subscriptionRoutes(fastify: FastifyInstance) {
    // Public route - anyone can view available plans
    fastify.get('/plans', getPlansHandler);

    // Protected route - get organization subscription
    fastify.get<{ Params: { organizationId: string } }>('/subscriptions/:organizationId', {
        onRequest: [fastify.authenticate]
    }, getSubscriptionHandler);
}
