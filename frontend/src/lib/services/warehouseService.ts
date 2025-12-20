import api from "@/lib/api";
import { db } from "@/lib/db";

export const warehouseService = {
    async listWarehouses(organizationId: string, token?: string) {
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await api.get('/warehouses', config);
            const { warehouses } = response.data;

            // Cache to Dexie
            if (typeof window !== 'undefined' && warehouses) {
                await db.warehouses.bulkPut(warehouses.map((w: any) => ({
                    id: w.id,
                    name: w.name,
                    code: w.code,
                    organizationId: w.organizationId
                })));
            }

            return warehouses || [];
        } catch (error) {
            console.warn('Warehouse Service: Offline mode');
            if (typeof window !== 'undefined') {
                return await db.warehouses.where({ organizationId }).toArray();
            }
            return [];
        }
    }
};
