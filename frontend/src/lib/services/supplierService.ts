import { db } from "@/lib/db";
import { BaseApiService } from "./baseService";

class SupplierService extends BaseApiService<any> {
    constructor() {
        super("/suppliers", db.suppliers, "SupplierService");
    }

    async listSuppliers(organizationId: string, token?: string) {
        return this.list(organizationId, { token });
    }
}

export const supplierService = new SupplierService();
