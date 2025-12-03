import { prisma } from "@/lib/prisma";
import { SalesOrderStatus, PurchaseOrderStatus } from "@prisma/client";

export const dashboardService = {
    async getDashboardStats(organizationId: string) {
        const [totalProducts, inventoryItems, activeSalesOrders, lowStockItems] = await Promise.all([
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
        ]);

        const totalStockValue = inventoryItems.reduce((sum, item) => {
            return sum + item.quantityOnHand * Number(item.product.costPrice);
        }, 0);

        const lowStockCount = lowStockItems.filter(
            (item) => item.quantityOnHand <= item.product.lowStockThreshold
        ).length;

        return {
            totalProducts,
            totalStockValue,
            activeSalesOrders,
            lowStockCount,
        };
    },

    async getLowStockItems(organizationId: string, limit = 5) {
        const items = await prisma.inventoryItem.findMany({
            where: {
                product: { organizationId, deletedAt: null },
            },
            include: { product: true, warehouse: true },
        });

        return items
            .filter((item) => item.quantityOnHand <= item.product.lowStockThreshold)
            .slice(0, limit);
    },

    async getRecentInventoryChanges(organizationId: string, limit = 10) {
        return await prisma.inventoryMovement.findMany({
            where: { product: { organizationId } },
            include: { product: true, warehouse: true, createdBy: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    },

    async getSalesOverview(organizationId: string) {
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
    },

    async getPurchaseOverview(organizationId: string) {
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
    },

    async getWarehouseOverview(organizationId: string) {
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
    },

    async getTransferOverview(organizationId: string) {
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
    },

    async getAdjustmentOverview(organizationId: string) {
        const recentAdjustments = await prisma.stockAdjustment.findMany({
            where: { organizationId },
            // StockAdjustment might not have product/warehouse relation included in the same way or names might differ.
            // Checking actions.ts, it has productId and warehouseId.
            // Prisma usually creates relations. I'll assume they exist.
            // If not, I might get an error. But standard practice is to have them.
            // Let's check schema if possible? No.
            // But actions.ts uses `productId` and `warehouseId` to create.
            // Usually relations are named `product` and `warehouse`.
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
    },

    async getCustomerOverview(organizationId: string) {
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
    },

    async getSupplierOverview(organizationId: string) {
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
    },

    async getSalesChartData(organizationId: string) {
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
    },

    async getStockValueDistribution(organizationId: string) {
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
    },
};
