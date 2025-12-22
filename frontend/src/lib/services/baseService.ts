import api from "@/lib/api";
import { db } from "@/lib/db";
import { Table } from "dexie";

export class BaseApiService<T extends { id: string; organizationId: string }> {
    constructor(
        private endpoint: string,
        private dexieTable: Table<T, string>,
        private serviceName: string
    ) { }

    async list(organizationId: string, options?: { token?: string; params?: any }): Promise<T[]> {
        try {
            const config = {
                headers: options?.token ? { Authorization: `Bearer ${options.token}` } : {},
                params: options?.params
            };
            const response = await api.get(this.endpoint, config);

            const data = response.data;
            const resourceKey = this.endpoint.replace("/", "");
            const items = data[resourceKey] || data.items || data.data || (Array.isArray(data) ? data : []);

            if (typeof window !== "undefined" && Array.isArray(items)) {
                await this.dexieTable.bulkPut(items);
            }

            return items;
        } catch (error) {
            console.warn(`${this.serviceName}: Offline mode or error fetching`, error);
            if (typeof window !== "undefined") {
                return await this.dexieTable.where({ organizationId }).toArray();
            }
            return [];
        }
    }

    async get(id: string, token?: string): Promise<T | null> {
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await api.get(`${this.endpoint}/${id}`, config);
            return response.data;
        } catch (error) {
            if (typeof window !== "undefined") {
                return (await this.dexieTable.get(id)) || null;
            }
            return null;
        }
    }
}
