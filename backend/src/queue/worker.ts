import { Worker, Job } from 'bullmq';
import { redis } from '../lib/redis.js';
import { cache } from '../lib/cache.js';

/**
 * Inventory Task Worker
 * Handles: Summary recalculation, Low stock alerts
 */
export const inventoryWorker = new Worker('inventory-tasks', async (job: Job) => {
    console.log(`Processing job ${job.id} [${job.name}]`);

    switch (job.name) {
        case 'recalculate-summary':
            const { organizationId, productId, warehouseId } = job.data;
            // 1. Perform heavy recalculation (Prisma logic here)
            // 2. Update stock_summary (denormalized table)
            // 3. Invalidate Redis Cache
            await cache.invalidate(`tenant:${organizationId}:product:${productId}`);
            await cache.invalidate(`tenant:${organizationId}:warehouse:${warehouseId}:stock`);
            break;

        default:
            console.warn(`Unexpected job name: ${job.name}`);
    }
}, { connection: redis });

inventoryWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed!`);
});

inventoryWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with ${err.message}`);
});
