import api from "@/lib/api";
import { db } from "@/lib/db";

export const supplierService = {
    async listSuppliers(organizationId: string, token?: string) {
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await api.get('/suppliers', config);
            const { suppliers } = response.data;

            // Cache to Dexie
            if (typeof window !== 'undefined' && suppliers) {
                await db.suppliers.bulkPut(suppliers.map((s: any) => ({
                    id: s.id,
                    name: s.name,
                    organizationId: s.organizationId
                })));
            }

            return suppliers || [];
        } catch (error) {
            console.warn('Supplier Service: Offline mode');
            if (typeof window !== 'undefined') {
                return await db.suppliers.where({ organizationId }).toArray();
            }
            return [];
        }
    },

    async createSupplier(data: any, token?: string) {
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await api.post('/suppliers', data, config);

            if (typeof window !== 'undefined') {
                await db.suppliers.put({
                    id: response.data.id,
                    name: response.data.name,
                    organizationId: response.data.organizationId
                });
            }
            return response.data;
        } catch (error: any) {
            if (!navigator.onLine || error.code === 'ECONNABORTED') {
                const offlineSupplier = {
                    ...data,
                    id: `offline-${Date.now()}`,
                    organizationId: data.organizationId || ''
                };
                if (typeof window !== 'undefined') {
                    await db.suppliers.put(offlineSupplier);
                    await db.syncQueue.add({
                        action: 'CREATE',
                        resource: 'SUPPLIER',
                        data: data,
                        createdAt: Date.now()
                    });
                }
                return offlineSupplier;
            }
            throw error;
        }
    }
};
