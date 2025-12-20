import { Worker, Job } from 'bullmq';
import { redis } from '../lib/redis.js';
import { cache } from '../lib/cache.js';
import { prisma } from '../lib/prisma.js';

/**
 * Inventory Task Worker
 * Handles: Summary recalculation, Low stock alerts
 */
export const inventoryWorker = new Worker('inventory-tasks', async (job: Job) => {
    console.log(`Processing job ${job.id} [${job.name}]`);

    switch (job.name) {
        case 'recalculate-summary':
            const { organizationId, productId, warehouseId } = job.data;

            // 1. Perform heavy recalculation
            const movements = await prisma.inventoryMovement.findMany({
                where: {
                    productId,
                    warehouseId,
                }
            });

            let totalIn = 0;
            let totalOut = 0;

            movements.forEach(m => {
                if (m.quantity > 0) totalIn += m.quantity;
                else totalOut += Math.abs(m.quantity);
            });

            // 2. Update stock_summary (denormalized table)
            await prisma.stockSummary.upsert({
                where: {
                    organizationId_warehouseId_productId: {
                        organizationId,
                        warehouseId,
                        productId
                    }
                },
                update: {
                    totalIn,
                    totalOut,
                    currentStock: totalIn - totalOut,
                    lastMovementAt: new Date()
                },
                create: {
                    organizationId,
                    warehouseId,
                    productId,
                    totalIn,
                    totalOut,
                    currentStock: totalIn - totalOut,
                }
            });

            // 3. Invalidate Redis Cache
            await cache.invalidate(`tenant:${organizationId}:product:${productId}`);
            await cache.invalidatePattern(`tenant:${organizationId}:products:*`); // Clear all list pages/searches
            await cache.invalidate(`tenant:${organizationId}:warehouse:${warehouseId}:stock`);
            await cache.invalidate(`tenant:${organizationId}:inventory:stats`);
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
