import { FastifyInstance } from 'fastify';
import { getSubscriptionHandler } from '../controllers/subscription.js';

export async function subscriptionRoutes(fastify: FastifyInstance) {
    // Protected route - get organization subscription
    fastify.get<{ Params: { organizationId: string } }>('/subscriptions/:organizationId', {
        onRequest: [fastify.authenticate]
    }, getSubscriptionHandler);
}
