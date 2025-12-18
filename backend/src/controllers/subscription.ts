import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';


export async function getSubscriptionHandler(req: FastifyRequest<{ Params: { organizationId: string } }>, reply: FastifyReply) {
    try {
        const user = req.user as { organizationId: string };
        const { organizationId } = req.params;

        // Ensure user can only access their own organization's subscription
        if (user.organizationId !== organizationId) {
            return reply.status(403).send({ error: 'Forbidden' });
        }

        const subscription = await prisma.subscription.findUnique({
            where: { organizationId },
            include: { plan: true }
        });

        if (!subscription) {
            return reply.status(404).send({ error: 'Subscription not found' });
        }

        return reply.send(subscription);
    } catch (error) {
        req.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch subscription' });
    }
}
