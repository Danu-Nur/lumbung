import { db } from "@/lib/db";
import { BaseApiService } from "./baseService";
import { Category } from "@prisma/client";

class CategoryService extends BaseApiService<any> {
    constructor() {
        super("/categories", db.categories, "CategoryService");
    }

    async listCategories(organizationId: string, token?: string) {
        return this.list(organizationId, { token });
    }
}

export const categoryService = new CategoryService();
