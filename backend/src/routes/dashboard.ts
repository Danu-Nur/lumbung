import { FastifyInstance } from 'fastify';
import {
    getDashboardStatsHandler,
    getLowStockItemsHandler,
    getRecentInventoryChangesHandler,
    getWarehouseOverviewHandler,
    getOperationalStatsHandler,
    getFinancialAnalyticsHandler,
    getRecentProductsHandler
} from '../controllers/dashboard.js';

export async function dashboardRoutes(fastify: FastifyInstance) {
    // All dashboard routes require authentication
    fastify.addHook('onRequest', fastify.authenticate);

    fastify.get('/dashboard/stats', getDashboardStatsHandler);
    fastify.get('/dashboard/low-stock', getLowStockItemsHandler);
    fastify.get('/dashboard/recent-changes', getRecentInventoryChangesHandler);
    fastify.get('/dashboard/warehouse-overview', getWarehouseOverviewHandler);
    fastify.get('/dashboard/operational-stats', getOperationalStatsHandler);
    fastify.get('/dashboard/financial-analytics', getFinancialAnalyticsHandler);
    fastify.get('/dashboard/recent-products', getRecentProductsHandler);
}
