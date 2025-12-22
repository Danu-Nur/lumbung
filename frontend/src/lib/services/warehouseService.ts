import { db } from "@/lib/db";
import { BaseApiService } from "./baseService";

class WarehouseService extends BaseApiService<any> {
    constructor() {
        super("/warehouses", db.warehouses, "WarehouseService");
    }

    async listWarehouses(organizationId: string, token?: string) {
        return this.list(organizationId, { token });
    }
}

export const warehouseService = new WarehouseService();
