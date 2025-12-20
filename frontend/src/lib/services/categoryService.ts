import api from "@/lib/api";
import { db } from "@/lib/db";

export const categoryService = {
    async listCategories(organizationId: string, token?: string) {
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await api.get('/categories', config);
            const { categories } = response.data;

            // Cache to Dexie
            if (typeof window !== 'undefined' && categories) {
                await db.categories.bulkPut(categories.map((c: any) => ({
                    id: c.id,
                    name: c.name,
                    organizationId: c.organizationId
                })));
            }

            return categories || [];
        } catch (error) {
            console.warn('Category Service: Offline mode');
            if (typeof window !== 'undefined') {
                return await db.categories.where({ organizationId }).toArray();
            }
            return [];
        }
    }
};
