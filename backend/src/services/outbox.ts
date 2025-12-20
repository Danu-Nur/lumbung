import { PrismaClient } from '@prisma/client';
import { inventoryQueue } from '../queue/queues.js';

const prisma = new PrismaClient();

/**
 * Outbox Service
 * Handles reliable message delivery to Redis/BullMQ
 */
export const outboxService = {
    /**
     * Process pending events
     * Should be called by a cron job or a dedicated short-lived worker
     */
    async processEvents() {
        const events = await prisma.outboxEvent.findMany({
            where: { status: 'PENDING' },
            take: 50,
            orderBy: { createdAt: 'asc' }
        });

        for (const event of events) {
            try {
                // Map topic to Queue
                switch (event.topic) {
                    case 'inventory.movement.created':
                        await inventoryQueue.add('recalculate-summary', event.payload);
                        break;
                    case 'mail.send':
                        // await mailQueue.add('send', event.payload);
                        break;
                }

                await prisma.outboxEvent.update({
                    where: { id: event.id },
                    data: { status: 'COMPLETED', processedAt: new Date() }
                });
            } catch (error: any) {
                await prisma.outboxEvent.update({
                    where: { id: event.id },
                    data: {
                        status: 'FAILED',
                        attempts: event.attempts + 1,
                        lastError: error.message
                    }
                });
            }
        }
    },

    async createEvent(data: { organizationId: string; topic: string; payload: any }, tx?: any) {
        const client = tx || prisma;
        return await client.outboxEvent.create({
            data: {
                organizationId: data.organizationId,
                topic: data.topic,
                payload: data.payload,
                status: 'PENDING'
            }
        });
    }
};
