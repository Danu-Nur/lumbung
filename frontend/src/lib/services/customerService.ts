import api from "@/lib/api";
import { db } from "@/lib/db";

export const customerService = {
    async listCustomers(params: {
        organizationId: string;
        page?: number;
        pageSize?: number;
        search?: string;
        token?: string;
    }) {
        try {
            const config = params.token ? { headers: { Authorization: `Bearer ${params.token}` } } : {};
            const response = await api.get('/customers', {
                params: {
                    page: params.page,
                    pageSize: params.pageSize,
                    q: params.search
                },
                ...config
            });

            const { customers, total } = response.data;

            // Cache to Dexie (Browser only)
            if (typeof window !== 'undefined' && customers) {
                await db.customers.bulkPut(customers.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    organizationId: c.organizationId
                })));
            }

            return { customers, total };
        } catch (error) {
            console.warn('Customer Service: Offline fallback');
            if (typeof window !== 'undefined') {
                let query = db.customers.where({ organizationId: params.organizationId });
                if (params.search) {
                    query = query.filter(c => c.name.toLowerCase().includes(params.search!.toLowerCase()));
                }
                const customers = await query.toArray();
                return { customers, total: customers.length };
            }
            return { customers: [], total: 0 };
        }
    },

    async createCustomer(data: any, token?: string) {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.post('/customers', data, config);

        if (typeof window !== 'undefined') {
            await db.customers.put({
                id: response.data.id,
                name: response.data.name,
                organizationId: response.data.organizationId
            });
        }

        return response.data;
    }
};
