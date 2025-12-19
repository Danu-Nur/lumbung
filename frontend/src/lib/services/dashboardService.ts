import api from "@/lib/api";
import { db } from "@/lib/db";

// Helper types until we fully share types between BE and FE
export interface DashboardStats {
    totalProducts: number;
    totalStockValue: number;
    activeSalesOrders: number;
    lowStockCount: number;
    totalSales: number;
    totalPurchases: number;
    profit: number;
}

export const dashboardService = {
    async getDashboardStats(organizationId: string, token?: string): Promise<DashboardStats> {
        try {
            // 1. Try Online
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.get(`/dashboard/stats`, {
                params: { organizationId },
                headers
            });
            return response.data;
        } catch (error) {
            console.warn('Dashboard Service: Offline mode (stats)');

            // 2. Offline Fallback (Calcs from Dexie)
            let productsCount = 0;
            let ordersCount = 0;

            if (typeof window !== 'undefined') {
                productsCount = await db.products.where({ organizationId }).count();
                ordersCount = await db.salesOrders.where({ organizationId }).count(); // Approximation
            }

            // Note: Full financial calcs are expensive offline, returning basic counts
            return {
                totalProducts: productsCount,
                totalStockValue: 0,
                activeSalesOrders: ordersCount,
                lowStockCount: 0,
                totalSales: 0,
                totalPurchases: 0,
                profit: 0
            };
        }
    },

    async getLowStockItems(organizationId: string, token?: string, limit = 5) {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.get(`/dashboard/low-stock`, {
                params: { organizationId, limit },
                headers
            });
            return response.data;
        } catch (error) {
            // Offline fallback: we can actually query this from db.products + inventory if synced
            // For now, simpler empty return
            return [];
        }
    },

    async getRecentInventoryChanges(organizationId: string, token?: string, limit = 10) {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.get(`/dashboard/recent-changes`, {
                params: { organizationId, limit },
                headers
            });
            return response.data;
        } catch (error) {
            return [];
        }
    },

    async getSalesOverview(organizationId: string) {
        try {
            const response = await api.get(`/dashboard/sales-overview`, { params: { organizationId } });
            return response.data;
        } catch (error) {
            let openOrdersCount = 0;
            if (typeof window !== 'undefined') {
                openOrdersCount = await db.salesOrders.where({ organizationId }).count();
            }
            return {
                todayCount: 0,
                todayValue: 0,
                monthCount: 0,
                monthValue: 0,
                openOrdersCount
            };
        }
    },

    async getPurchaseOverview(organizationId: string) {
        try {
            const response = await api.get(`/dashboard/purchase-overview`, { params: { organizationId } });
            return response.data;
        } catch (error) {
            let openPurchasesCount = 0;
            if (typeof window !== 'undefined') {
                openPurchasesCount = await db.purchaseOrders.where({ organizationId }).count();
            }
            return {
                todayCount: 0,
                todayValue: 0,
                openPurchasesCount
            };
        }
    },

    async getWarehouseOverview(organizationId: string, token?: string) {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.get(`/dashboard/warehouse-overview`, {
                params: { organizationId },
                headers
            });
            return response.data;
        } catch (error) {
            let warehouses: any[] = [];
            if (typeof window !== 'undefined') {
                warehouses = await db.warehouses.where({ organizationId }).toArray();
            }
            return {
                totalWarehouses: warehouses.length,
                topWarehouses: []
            };
        }
    },

    async getTransferOverview(organizationId: string) {
        try {
            const response = await api.get(`/dashboard/transfer-overview`, { params: { organizationId } });
            return response.data;
        } catch (error) {
            return {
                pendingCount: 0,
                recentTransfers: []
            };
        }
    },

    async getAdjustmentOverview(organizationId: string) {
        try {
            const response = await api.get(`/dashboard/adjustment-overview`, { params: { organizationId } });
            return response.data;
        } catch (error) {
            return { recentAdjustments: [] };
        }
    },

    async getCustomerOverview(organizationId: string) {
        try {
            const response = await api.get(`/dashboard/customer-overview`, { params: { organizationId } });
            return response.data;
        } catch (error) {
            let totalCustomers = 0;
            if (typeof window !== 'undefined') {
                totalCustomers = await db.customers.where({ organizationId }).count();
            }
            return {
                totalCustomers,
                recentCustomers: [] // Could be fetched from db.customers if we had createdAt
            };
        }
    },

    async getSupplierOverview(organizationId: string) {
        try {
            const response = await api.get(`/dashboard/supplier-overview`, { params: { organizationId } });
            return response.data;
        } catch (error) {
            let totalSuppliers = 0;
            if (typeof window !== 'undefined') {
                totalSuppliers = await db.suppliers.where({ organizationId }).count();
            }
            return {
                totalSuppliers,
                recentSuppliers: []
            };
        }
    },

    async getSalesChartData(organizationId: string) {
        try {
            const response = await api.get(`/dashboard/sales-chart`, { params: { organizationId } });
            return response.data;
        } catch (error) {
            return [];
        }
    },

    async getStockValueDistribution(organizationId: string) {
        try {
            const response = await api.get(`/dashboard/stock-distribution`, { params: { organizationId } });
            return response.data;
        } catch (error) {
            return [];
        }
    },

    async getOperationalStats(organizationId: string, token?: string) {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.get(`/dashboard/operational-stats`, {
                params: { organizationId },
                headers
            });
            return response.data;
        } catch (error) {
            let counts = { customers: 0, suppliers: 0, products: 0 };

            if (typeof window !== 'undefined') {
                counts.customers = await db.customers.where({ organizationId }).count();
                counts.suppliers = await db.suppliers.where({ organizationId }).count();
                counts.products = await db.products.where({ organizationId }).count();
            }

            return {
                totalCustomers: counts.customers,
                totalSuppliers: counts.suppliers,
                totalProducts: counts.products,
                totalSalesInvoices: 0,
            };
        }
    },

    async getFinancialAnalytics(organizationId: string, token?: string) {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.get(`/dashboard/financial-analytics`, {
                params: { organizationId },
                headers
            });
            return response.data;
        } catch (error) {
            return {
                monthly: [],
                yearly: { sales: 0, purchase: 0, profit: 0 }
            };
        }
    },

    async getRecentProducts(organizationId: string, token?: string, limit = 5) {
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await api.get(`/dashboard/recent-products`, {
                params: { organizationId, limit },
                headers
            });
            return response.data;
        } catch (error) {
            // Simplified offline fetch
            if (typeof window !== 'undefined') {
                const products = await db.products
                    .where({ organizationId })
                    .limit(limit)
                    .toArray();
                return products;
            }
            return [];
        }
    },
};
