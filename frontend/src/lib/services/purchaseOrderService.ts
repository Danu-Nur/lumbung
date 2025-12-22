import api from "@/lib/api";
import { db } from "@/lib/db";

export const purchaseOrderService = {
    async listPurchaseOrders(params: {
        organizationId: string;
        page?: number;
        pageSize?: number;
        search?: string;
        token?: string;
    }) {
        try {
            const config = params.token ? { headers: { Authorization: `Bearer ${params.token}` } } : {};
            const response = await api.get('/purchase-orders', {
                params: {
                    page: params.page,
                    pageSize: params.pageSize,
                    q: params.search
                },
                ...config
            });

            const { orders, total } = response.data;

            // Cache to Dexie
            if (typeof window !== 'undefined' && orders) {
                await db.purchaseOrders.bulkPut(orders.map((o: any) => ({
                    ...o,
                    synced: true
                })));
            }

            return { orders, total };
        } catch (error) {
            console.warn('PurchaseOrder Service: Offline fallback');
            if (typeof window !== 'undefined') {
                const orders = await db.purchaseOrders
                    .where({ organizationId: params.organizationId })
                    .reverse()
                    .sortBy('createdAt');

                const filtered = params.search
                    ? orders.filter(o => o.poNumber.includes(params.search!) || o.supplier?.name.includes(params.search!))
                    : orders;

                return { orders: filtered, total: filtered.length };
            }
            return { orders: [], total: 0 };
        }
    },

    async createPurchaseOrder(data: any, token?: string) {
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await api.post('/purchase-orders', data, config);

            if (typeof window !== 'undefined') {
                await db.purchaseOrders.put({
                    ...response.data,
                    synced: true
                });
            }
            return response.data;
        } catch (error: any) {
            if (!navigator.onLine || error.code === 'ECONNABORTED') {
                const offlineOrder = {
                    ...data,
                    id: `offline-po-${Date.now()}`,
                    poNumber: `PO-PENDING-${Date.now()}`,
                    status: 'DRAFT',
                    createdAt: new Date().toISOString(),
                    synced: false
                };

                if (typeof window !== 'undefined') {
                    await db.purchaseOrders.put(offlineOrder);
                    await db.syncQueue.add({
                        action: 'CREATE',
                        resource: 'ORDER', // We use resource ORDER or categorize it better?
                        data: { ...data, type: 'PURCHASE' },
                        createdAt: Date.now()
                    });
                }
                return offlineOrder;
            }
            throw error;
        }
    },

    async completeOrder(id: string, token?: string) {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.post(`/purchase-orders/${id}/complete`, {}, config);
        if (typeof window !== 'undefined') {
            await db.purchaseOrders.update(id, { status: 'COMPLETED' });
        }
        return response.data;
    },

    async createPurchaseReceipt(data: {
        purchaseOrderId: string;
        organizationId: string;
        receivedItems: Array<{ productId: string; quantity: number }>;
        notes?: string;
        userId: string;
    }, token?: string) {
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await api.post(`/purchase-orders/${data.purchaseOrderId}/receive`, {
                receivedItems: data.receivedItems,
                notes: data.notes
            }, config);

            // Update local cache
            if (typeof window !== 'undefined') {
                await db.purchaseOrders.update(data.purchaseOrderId, {
                    status: response.data.status || 'PARTIALLY_RECEIVED'
                });
            }

            return response.data;
        } catch (error: any) {
            if (!navigator.onLine || error.code === 'ECONNABORTED') {
                // Queue for offline sync
                if (typeof window !== 'undefined') {
                    await db.syncQueue.add({
                        action: 'CREATE',
                        resource: 'PURCHASE_ORDER',
                        data: data,
                        createdAt: Date.now()
                    });
                }
                return { id: `offline-receipt-${Date.now()}`, ...data, synced: false };
            }
            throw error;
        }
    }
};
