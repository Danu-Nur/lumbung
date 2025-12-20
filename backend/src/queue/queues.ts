import { Queue } from 'bullmq';
import { redis } from '../lib/redis.js';

// Define Queues
export const inventoryQueue = new Queue('inventory-tasks', {
    connection: redis,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
    },
});

export const mailQueue = new Queue('mail-tasks', {
    connection: redis,
});

/**
 * Helper to push inventory sync jobs
 */
export const pushInventorySync = async (data: any) => {
    await inventoryQueue.add('recalculate-summary', data);
};
