import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { SalesOrderStatus, PurchaseOrderStatus } from '@prisma/client';
import { cache } from '../lib/cache.js';

export async function getDashboardStatsHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;
        const cacheKey = `tenant:${organizationId}:inventory:stats`;

        const stats = await cache.getOrSet(cacheKey, async () => {
            const [
                products,
                activeSalesOrders,
                salesAgg,
                purchaseAgg
            ] = await Promise.all([
                prisma.product.findMany({
                    where: { organizationId, deletedAt: null },
                    include: {
                        inventoryItems: {
                            select: {
                                quantityOnHand: true,
                                unitCost: true
                            }
                        }
                    }
                }),
                prisma.salesOrder.count({
                    where: { organizationId, status: { in: [SalesOrderStatus.DRAFT, SalesOrderStatus.CONFIRMED] } },
                }),
                prisma.salesOrder.aggregate({
                    where: { organizationId, status: { not: SalesOrderStatus.CANCELLED } },
                    _sum: { total: true },
                }),
                prisma.purchaseOrder.aggregate({
                    where: { organizationId, status: { not: PurchaseOrderStatus.CANCELLED } },
                    _sum: { total: true },
                }),
            ]);

            let outOfStockCount = 0;
            let lowStockCount = 0;
            let totalStockValue = 0;

            products.forEach(product => {
                const totalStock = product.inventoryItems.reduce((sum, item) => {
                    const val = item.quantityOnHand * Number(item.unitCost);
                    totalStockValue += val;
                    return sum + item.quantityOnHand;
                }, 0);

                if (totalStock <= 0) {
                    outOfStockCount++;
                } else if (totalStock <= (product.lowStockThreshold || 0)) {
                    lowStockCount++;
                }
            });

            const totalProducts = products.length;
            const totalSales = Number(salesAgg._sum.total || 0);
            const totalPurchases = Number(purchaseAgg._sum.total || 0);
            const profit = totalSales - totalPurchases;

            return {
                totalProducts,
                totalStockValue,
                activeSalesOrders,
                lowStockCount,
                outOfStockCount,
                totalSales,
                totalPurchases,
                profit
            };
        }, 60); // 1 minute cache for stats

        return reply.send(stats);
    } catch (error) {
        req.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch dashboard stats' });
    }
}

export async function getLowStockItemsHandler(req: FastifyRequest<{ Querystring: { limit?: string } }>, reply: FastifyReply) {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;
        const limit = parseInt(req.query.limit || '5');

        const items = await prisma.inventoryItem.findMany({
            where: {
                product: { organizationId, deletedAt: null },
            },
            include: { product: true, warehouse: true },
        });

        const lowStockItems = items
            .filter((item) => item.quantityOnHand <= item.product.lowStockThreshold)
            .slice(0, limit);

        return reply.send(lowStockItems);
    } catch (error) {
        req.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch low stock items' });
    }
}

export async function getRecentInventoryChangesHandler(req: FastifyRequest<{ Querystring: { limit?: string } }>, reply: FastifyReply) {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;
        const limit = parseInt(req.query.limit || '10');

        const changes = await prisma.inventoryMovement.findMany({
            where: { product: { organizationId } },
            include: { product: true, warehouse: true, createdBy: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return reply.send(changes);
    } catch (error) {
        req.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch inventory changes' });
    }
}

export async function getWarehouseOverviewHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;

        const warehouses = await prisma.warehouse.findMany({
            where: { organizationId },
            include: {
                inventoryItems: {
                    include: { product: true },
                },
            },
        });

        const warehouseStats = warehouses.map(wh => {
            const stockValue = wh.inventoryItems.reduce((sum, item) => {
                return sum + item.quantityOnHand * Number(item.product.costPrice);
            }, 0);
            return {
                id: wh.id,
                name: wh.name,
                stockValue,
                itemCount: wh.inventoryItems.length,
            };
        });

        warehouseStats.sort((a, b) => b.stockValue - a.stockValue);

        return reply.send({
            totalWarehouses: warehouses.length,
            topWarehouses: warehouseStats.slice(0, 3),
        });
    } catch (error) {
        req.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch warehouse overview' });
    }
}

export async function getOperationalStatsHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;

        const [totalCustomers, totalSuppliers, totalProducts, totalSalesInvoices] = await Promise.all([
            prisma.customer.count({ where: { organizationId } }),
            prisma.supplier.count({ where: { organizationId } }),
            prisma.product.count({ where: { organizationId, deletedAt: null } }),
            prisma.salesOrder.count({ where: { organizationId, status: { not: SalesOrderStatus.CANCELLED } } }),
        ]);

        return reply.send({
            totalCustomers,
            totalSuppliers,
            totalProducts,
            totalSalesInvoices,
        });
    } catch (error) {
        req.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch operational stats' });
    }
}

export async function getFinancialAnalyticsHandler(req: FastifyRequest, reply: FastifyReply) {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;

        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59);

        const [sales, purchases] = await Promise.all([
            prisma.salesOrder.findMany({
                where: {
                    organizationId,
                    createdAt: { gte: startOfYear, lte: endOfYear },
                    status: { not: SalesOrderStatus.CANCELLED },
                },
                select: { createdAt: true, total: true },
            }),
            prisma.purchaseOrder.findMany({
                where: {
                    organizationId,
                    createdAt: { gte: startOfYear, lte: endOfYear },
                    status: { not: PurchaseOrderStatus.CANCELLED },
                },
                select: { createdAt: true, total: true },
            }),
        ]);

        const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
            month: new Date(today.getFullYear(), i, 1).toLocaleString('default', { month: 'short' }),
            sales: 0,
            purchase: 0,
            profit: 0,
        }));

        let yearlyStats = {
            sales: 0,
            purchase: 0,
            profit: 0,
        };

        sales.forEach(order => {
            const month = order.createdAt.getMonth();
            const val = Number(order.total);
            if (monthlyStats[month]) {
                monthlyStats[month].sales += val;
                monthlyStats[month].profit += val;
            }
            yearlyStats.sales += val;
            yearlyStats.profit += val;
        });

        purchases.forEach(order => {
            const month = order.createdAt.getMonth();
            const val = Number(order.total);
            if (monthlyStats[month]) {
                monthlyStats[month].purchase += val;
                monthlyStats[month].profit -= val;
            }
            yearlyStats.purchase += val;
            yearlyStats.profit -= val;
        });

        return reply.send({
            monthly: monthlyStats,
            yearly: yearlyStats,
        });
    } catch (error) {
        req.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch financial analytics' });
    }
}

export async function getRecentProductsHandler(req: FastifyRequest<{ Querystring: { limit?: string } }>, reply: FastifyReply) {
    try {
        const user = req.user as { organizationId: string };
        const organizationId = user.organizationId;
        const limit = parseInt(req.query.limit || '5');

        const products = await prisma.product.findMany({
            where: { organizationId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                name: true,
                sku: true,
                createdAt: true,
            }
        });

        return reply.send(products);
    } catch (error) {
        req.log.error(error);
        return reply.status(500).send({ error: 'Failed to fetch recent products' });
    }
}
