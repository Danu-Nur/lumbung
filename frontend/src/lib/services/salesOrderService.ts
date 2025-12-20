import api from "@/lib/api";
import { db } from "@/lib/db";

export const salesOrderService = {
    async listSalesOrders(params: {
        organizationId: string;
        page?: number;
        pageSize?: number;
        search?: string;
        token?: string;
    }) {
        try {
            const config = params.token ? { headers: { Authorization: `Bearer ${params.token}` } } : {};
            const response = await api.get('/orders', {
                params: {
                    page: params.page,
                    pageSize: params.pageSize,
                    q: params.search
                },
                ...config
            });

            const { orders, total } = response.data;

            // Cache to Dexie (for offline view)
            if (typeof window !== 'undefined' && orders) {
                await db.salesOrders.bulkPut(orders.map((o: any) => ({
                    ...o,
                    synced: true // Already synced since it came from API
                })));
            }

            return { orders, total };
        } catch (error) {
            console.warn('SalesOrder Service: Offline fallback');
            if (typeof window !== 'undefined') {
                const orders = await db.salesOrders
                    .where({ organizationId: params.organizationId })
                    .reverse()
                    .sortBy('createdAt');

                // Simple filter for search
                const filtered = params.search
                    ? orders.filter(o => o.orderNumber.includes(params.search!) || o.customer?.name.includes(params.search!))
                    : orders;

                return { orders: filtered, total: filtered.length };
            }
            return { orders: [], total: 0 };
        }
    },

    async createSalesOrder(data: any, token?: string) {
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await api.post('/orders', data, config);

            if (typeof window !== 'undefined') {
                await db.salesOrders.put({
                    ...response.data,
                    synced: true
                });
            }
            return response.data;
        } catch (error: any) {
            if (!navigator.onLine || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
                console.log('Offline: Queuing Sales Order');
                const offlineOrder = {
                    ...data,
                    id: `offline-${Date.now()}`,
                    orderNumber: `SO-PENDING-${Date.now()}`,
                    status: 'DRAFT',
                    createdAt: new Date().toISOString(),
                    synced: false
                };

                if (typeof window !== 'undefined') {
                    await db.salesOrders.put(offlineOrder);
                    await db.syncQueue.add({
                        action: 'CREATE',
                        resource: 'ORDER',
                        data: data,
                        createdAt: Date.now()
                    });
                }
                return offlineOrder;
            }
            throw error;
        }
    },

    async confirmOrder(id: string, token?: string) {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.post(`/orders/${id}/confirm`, {}, config);
        if (typeof window !== 'undefined') {
            await db.salesOrders.update(id, { status: 'CONFIRMED' });
        }
        return response.data;
    },

    async fulfillOrder(id: string, token?: string) {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.post(`/orders/${id}/fulfill`, {}, config);
        if (typeof window !== 'undefined') {
            await db.salesOrders.update(id, { status: 'FULFILLED' });
        }
        return response.data;
    }
};
