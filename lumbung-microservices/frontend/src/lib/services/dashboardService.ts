import { prisma } from "@/lib/prisma";
import { SalesOrderStatus, PurchaseOrderStatus } from "@prisma/client";

export const dashboardService = {
    async getDashboardStats(organizationId: string) {
        try {
            const [
                totalProducts,
                inventoryItems,
                activeSalesOrders,
                lowStockItems,
                salesAgg,
                purchaseAgg
            ] = await Promise.all([
                prisma.product.count({
                    where: { organizationId, deletedAt: null },
                }),
                prisma.inventoryItem.findMany({
                    where: { product: { organizationId } },
                    include: { product: true },
                }),
                prisma.salesOrder.count({
                    where: { organizationId, status: { in: [SalesOrderStatus.DRAFT, SalesOrderStatus.CONFIRMED] } },
                }),
                prisma.inventoryItem.findMany({
                    where: { product: { organizationId, deletedAt: null } },
                    include: { product: true, warehouse: true },
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

            const totalStockValue = inventoryItems.reduce((sum, item) => {
                return sum + item.quantityOnHand * Number(item.product.costPrice);
            }, 0);

            const lowStockCount = lowStockItems.filter(
                (item) => item.quantityOnHand <= item.product.lowStockThreshold
            ).length;

            const totalSales = Number(salesAgg._sum.total || 0);
            const totalPurchases = Number(purchaseAgg._sum.total || 0);
            const profit = totalSales - totalPurchases;

            return {
                totalProducts,
                totalStockValue,
                activeSalesOrders,
                lowStockCount,
                totalSales,
                totalPurchases,
                profit
            };
        } catch (error) {
            console.error('Frontend DB Error (getDashboardStats):', error);
            // Return dummy data/offline fallback
            return {
                totalProducts: 0,
                totalStockValue: 0,
                activeSalesOrders: 0,
                lowStockCount: 0,
                totalSales: 0,
                totalPurchases: 0,
                profit: 0
            };
        }
    },

    async getLowStockItems(organizationId: string, limit = 5) {
        try {
            const items = await prisma.inventoryItem.findMany({
                where: {
                    product: { organizationId, deletedAt: null },
                },
                include: { product: true, warehouse: true },
            });

            return items
                .filter((item) => item.quantityOnHand <= item.product.lowStockThreshold)
                .slice(0, limit);
        } catch (error) {
            console.error('Frontend DB Error (getLowStockItems):', error);
            return [];
        }
    },

    async getRecentInventoryChanges(organizationId: string, limit = 10) {
        try {
            return await prisma.inventoryMovement.findMany({
                where: { product: { organizationId } },
                include: { product: true, warehouse: true, createdBy: true },
                orderBy: { createdAt: 'desc' },
                take: limit,
            });
        } catch (error) {
            console.error('Frontend DB Error (getRecentInventoryChanges):', error);
            return [];
        }
    },

    async getSalesOverview(organizationId: string) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

            const [todaySales, monthSales, openOrdersCount] = await Promise.all([
                prisma.salesOrder.aggregate({
                    where: {
                        organizationId,
                        createdAt: { gte: today },
                        status: { not: SalesOrderStatus.CANCELLED },
                    },
                    _count: true,
                    _sum: { total: true },
                }),
                prisma.salesOrder.aggregate({
                    where: {
                        organizationId,
                        createdAt: { gte: firstDayOfMonth },
                        status: { not: SalesOrderStatus.CANCELLED },
                    },
                    _count: true,
                    _sum: { total: true },
                }),
                prisma.salesOrder.count({
                    where: {
                        organizationId,
                        status: { in: [SalesOrderStatus.DRAFT, SalesOrderStatus.CONFIRMED] },
                    },
                }),
            ]);

            return {
                todayCount: todaySales._count,
                todayValue: Number(todaySales._sum.total || 0),
                monthCount: monthSales._count,
                monthValue: Number(monthSales._sum.total || 0),
                openOrdersCount,
            };
        } catch (error) {
            console.error('Frontend DB Error (getSalesOverview):', error);
            return {
                todayCount: 0,
                todayValue: 0,
                monthCount: 0,
                monthValue: 0,
                openOrdersCount: 0,
            };
        }
    },

    async getPurchaseOverview(organizationId: string) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const [todayPurchases, openPurchasesCount] = await Promise.all([
                prisma.purchaseOrder.aggregate({
                    where: {
                        organizationId,
                        createdAt: { gte: today },
                        status: { not: PurchaseOrderStatus.CANCELLED },
                    },
                    _count: true,
                    _sum: { total: true },
                }),
                prisma.purchaseOrder.count({
                    where: {
                        organizationId,
                        status: { in: [PurchaseOrderStatus.DRAFT, PurchaseOrderStatus.PARTIALLY_RECEIVED] },
                    },
                }),
            ]);

            return {
                todayCount: todayPurchases._count,
                todayValue: Number(todayPurchases._sum.total || 0),
                openPurchasesCount,
            };
        } catch (error) {
            console.error('Frontend DB Error (getPurchaseOverview):', error);
            return {
                todayCount: 0,
                todayValue: 0,
                openPurchasesCount: 0,
            };
        }
    },

    async getWarehouseOverview(organizationId: string) {
        try {
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

            // Sort by stock value desc
            warehouseStats.sort((a, b) => b.stockValue - a.stockValue);

            return {
                totalWarehouses: warehouses.length,
                topWarehouses: warehouseStats.slice(0, 3),
            };
        } catch (error) {
            console.error('Frontend DB Error (getWarehouseOverview):', error);
            return {
                totalWarehouses: 0,
                topWarehouses: [],
            };
        }
    },

    async getTransferOverview(organizationId: string) {
        try {
            const [pendingCount, recentTransfers] = await Promise.all([
                prisma.stockTransfer.count({
                    where: {
                        organizationId,
                        status: { in: ['DRAFT', 'IN_TRANSIT'] },
                    },
                }),
                prisma.stockTransfer.findMany({
                    where: { organizationId },
                    include: {
                        fromWarehouse: true,
                        toWarehouse: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                }),
            ]);

            return {
                pendingCount,
                recentTransfers,
            };
        } catch (error) {
            console.error('Frontend DB Error (getTransferOverview):', error);
            return {
                pendingCount: 0,
                recentTransfers: [],
            };
        }
    },

    async getAdjustmentOverview(organizationId: string) {
        try {
            const recentAdjustments = await prisma.stockAdjustment.findMany({
                where: { organizationId },
                include: {
                    product: true,
                    warehouse: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            });

            return {
                recentAdjustments,
            };
        } catch (error) {
            console.error('Frontend DB Error (getAdjustmentOverview):', error);
            return {
                recentAdjustments: [],
            };
        }
    },

    async getCustomerOverview(organizationId: string) {
        try {
            const [totalCustomers, recentCustomers] = await Promise.all([
                prisma.customer.count({
                    where: { organizationId },
                }),
                prisma.customer.findMany({
                    where: { organizationId },
                    orderBy: { createdAt: 'desc' },
                    take: 3,
                }),
            ]);

            return {
                totalCustomers,
                recentCustomers,
            };
        } catch (error) {
            console.error('Frontend DB Error (getCustomerOverview):', error);
            return {
                totalCustomers: 0,
                recentCustomers: [],
            };
        }
    },

    async getSupplierOverview(organizationId: string) {
        try {
            const [totalSuppliers, recentSuppliers] = await Promise.all([
                prisma.supplier.count({
                    where: { organizationId },
                }),
                prisma.supplier.findMany({
                    where: { organizationId },
                    orderBy: { createdAt: 'desc' },
                    take: 3,
                }),
            ]);

            return {
                totalSuppliers,
                recentSuppliers,
            };
        } catch (error) {
            console.error('Frontend DB Error (getSupplierOverview):', error);
            return {
                totalSuppliers: 0,
                recentSuppliers: [],
            };
        }
    },

    async getSalesChartData(organizationId: string) {
        try {
            const today = new Date();
            const last7Days = new Date(today);
            last7Days.setDate(today.getDate() - 6);
            last7Days.setHours(0, 0, 0, 0);

            const sales = await prisma.salesOrder.groupBy({
                by: ['createdAt'],
                where: {
                    organizationId,
                    createdAt: { gte: last7Days },
                    status: { not: SalesOrderStatus.CANCELLED },
                },
                _sum: {
                    total: true,
                },
            });

            // Format data for chart: fill missing days with 0
            const chartData = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(last7Days);
                d.setDate(last7Days.getDate() + i);
                const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

                const daySales = sales.find(s => s.createdAt.toISOString().split('T')[0] === dateStr);
                chartData.push({
                    date: dateStr,
                    total: daySales?._sum.total ? Number(daySales._sum.total) : 0,
                });
            }

            return chartData;
        } catch (error) {
            console.error('Frontend DB Error (getSalesChartData):', error);
            return [];
        }
    },

    async getStockValueDistribution(organizationId: string) {
        try {
            const warehouses = await prisma.warehouse.findMany({
                where: { organizationId },
                include: {
                    inventoryItems: {
                        include: { product: true },
                    },
                },
            });

            return warehouses.map(wh => ({
                name: wh.name,
                value: wh.inventoryItems.reduce((sum, item) => {
                    return sum + item.quantityOnHand * Number(item.product.costPrice);
                }, 0),
            })).filter(item => item.value > 0);
        } catch (error) {
            console.error('Frontend DB Error (getStockValueDistribution):', error);
            return [];
        }
    },

    async getOperationalStats(organizationId: string) {
        try {
            const [totalCustomers, totalSuppliers, totalProducts, totalSalesInvoices] = await Promise.all([
                prisma.customer.count({ where: { organizationId } }),
                prisma.supplier.count({ where: { organizationId } }),
                prisma.product.count({ where: { organizationId, deletedAt: null } }),
                prisma.salesOrder.count({ where: { organizationId, status: { not: SalesOrderStatus.CANCELLED } } }),
            ]);

            return {
                totalCustomers,
                totalSuppliers,
                totalProducts,
                totalSalesInvoices,
            };
        } catch (error) {
            console.error('Frontend DB Error (getOperationalStats):', error);
            return {
                totalCustomers: 0,
                totalSuppliers: 0,
                totalProducts: 0,
                totalSalesInvoices: 0,
            };
        }
    },

    async getFinancialAnalytics(organizationId: string) {
        try {
            const today = new Date();
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59);

            // Fetch all relevant orders for the year
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
                rawDate: new Date(today.getFullYear(), i, 1),
            }));

            let yearlyStats = {
                sales: 0,
                purchase: 0,
                profit: 0,
            };

            // Aggregate Sales
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

            // Aggregate Purchases
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

            return {
                monthly: monthlyStats,
                yearly: yearlyStats,
            };
        } catch (error) {
            console.error('Frontend DB Error (getFinancialAnalytics):', error);
            // Return empty stats structure
            return {
                monthly: [],
                yearly: { sales: 0, purchase: 0, profit: 0 }
            };
        }
    },

    async getRecentProducts(organizationId: string, limit = 5) {
        try {
            return await prisma.product.findMany({
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
        } catch (error) {
            console.error('Frontend DB Error (getRecentProducts):', error);
            return [];
        }
    },
};
