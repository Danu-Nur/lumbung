import api from "@/lib/api";
import { db } from "@/lib/db";

export const productService = {
    /**
     * Create a new product
     */
    async createProduct(params: {
        organizationId: string;
        name: string;
        sku: string;
        barcode?: string | null;
        description?: string | null;
        categoryId?: string | null;
        supplierId?: string | null;
        unit: string;
        sellingPrice: number;
        costPrice: number;
        lowStockThreshold?: number;
        initialStock?: number;
        warehouseId?: string;
        createdById: string;
        token?: string;
    }) {
        try {
            const config = params.token ? { headers: { Authorization: `Bearer ${params.token}` } } : {};
            const response = await api.post('/products', params, config);
            // Cache on success (Browser only)
            if (typeof window !== 'undefined') {
                await db.products.put({
                    id: response.data.id,
                    name: response.data.name,
                    sku: response.data.sku,
                    sellingPrice: Number(response.data.sellingPrice),
                    costPrice: Number(response.data.costPrice),
                    categoryId: response.data.categoryId,
                    organizationId: response.data.organizationId,
                    updatedAt: response.data.updatedAt
                });
            }
            return response.data;
        } catch (error: any) {
            if (typeof window !== 'undefined' && (!error.response || error.code === 'ERR_NETWORK')) {
                const tempId = `temp-${crypto.randomUUID()}`;
                const newProduct = {
                    ...params,
                    id: tempId,
                    updatedAt: new Date().toISOString(),
                    // Ensure optional fields are handled or undefined
                    barcode: params.barcode || undefined,
                    description: params.description || undefined,
                };

                await db.products.add({
                    id: tempId,
                    name: params.name,
                    sku: params.sku,
                    sellingPrice: params.sellingPrice,
                    costPrice: params.costPrice,
                    categoryId: params.categoryId || undefined,
                    organizationId: params.organizationId,
                    updatedAt: new Date().toISOString()
                });

                await db.syncQueue.add({
                    action: 'CREATE',
                    resource: 'PRODUCT',
                    data: params,
                    createdAt: Date.now()
                });

                return newProduct;
            }
            // On server, or if it's a real API error (400, 500, etc.), throw it
            console.error("API Error in createProduct:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Update a product
     */
    async updateProduct(params: {
        id: string;
        organizationId: string;
        data: {
            name?: string;
            sku?: string;
            barcode?: string | null;
            description?: string | null;
            categoryId?: string | null;
            supplierId?: string | null;
            unit?: string;
            sellingPrice?: number;
            costPrice?: number;
            lowStockThreshold?: number;
        };
        updatedById: string;
        token?: string;
    }) {
        try {
            const config = params.token ? { headers: { Authorization: `Bearer ${params.token}` } } : {};
            // Flatten params.data to root for backend compatibility
            const body = {
                ...params.data,
                organizationId: params.organizationId,
                userId: params.updatedById
            };
            const response = await api.put(`/products/${params.id}`, body, config);

            // Update cache (Browser only)
            if (typeof window !== 'undefined') {
                const p = response.data;
                await db.products.put({
                    id: p.id,
                    name: p.name,
                    sku: p.sku,
                    sellingPrice: Number(p.sellingPrice),
                    costPrice: Number(p.costPrice),
                    categoryId: p.categoryId,
                    organizationId: p.organizationId,
                    updatedAt: p.updatedAt,
                    unit: p.unit,
                    barcode: p.barcode,
                    description: p.description,
                    lowStockThreshold: p.lowStockThreshold,
                    supplierId: p.supplierId
                });
            }

            return response.data;
        } catch (error: any) {
            if (typeof window !== 'undefined' && (!error.response || error.code === 'ERR_NETWORK')) {
                const existing = await db.products.get(params.id);
                if (existing) {
                    await db.products.update(params.id, {
                        ...params.data,
                        updatedAt: new Date().toISOString()
                    });

                    await db.syncQueue.add({
                        action: 'UPDATE',
                        resource: 'PRODUCT',
                        data: params,
                        createdAt: Date.now()
                    });

                    return { ...existing, ...params.data };
                }
            }
            throw error;
        }
    },

    /**
     * Soft delete a product
     */
    async deleteProduct(params: {
        id: string;
        organizationId: string;
        updatedById: string;
        token?: string;
    }) {
        try {
            const config = {
                data: params,
                ...(params.token ? { headers: { Authorization: `Bearer ${params.token}` } } : {})
            };
            await api.delete(`/products/${params.id}`, config);
            if (typeof window !== 'undefined') {
                await db.products.delete(params.id);
            }
            return true;
        } catch (error: any) {
            if (typeof window !== 'undefined' && (!error.response || error.code === 'ERR_NETWORK')) {
                await db.products.delete(params.id); // Valid optimistically
                await db.syncQueue.add({
                    action: 'DELETE',
                    resource: 'PRODUCT',
                    data: params,
                    createdAt: Date.now()
                });
                return true;
            }
            throw error;
        }
    },

    /**
     * Sets the default supplier for a product.
     */
    async setProductDefaultSupplier(params: {
        productId: string;
        supplierId: string;
        organizationId: string;
        token?: string;
    }) {
        try {
            const config = params.token ? { headers: { Authorization: `Bearer ${params.token}` } } : {};
            const response = await api.post(`/products/${params.productId}/supplier`, params, config);
            return response.data;
        } catch (error: any) {
            // Basic offline queue (Browser only)
            if (typeof window !== 'undefined' && (!error.response || error.code === 'ERR_NETWORK')) {
                await db.syncQueue.add({
                    action: 'UPDATE', // It's effectively an update
                    resource: 'PRODUCT',
                    data: { ...params, id: params.productId, data: { supplierId: params.supplierId } },
                    createdAt: Date.now()
                });
                return { success: true, offline: true };
            }
            throw error;
        }
    },

    /**
     * Clears the default supplier for a product.
     */
    async clearProductDefaultSupplier(params: {
        productId: string;
        organizationId: string;
        token?: string;
    }) {
        try {
            const config = {
                data: params,
                ...(params.token ? { headers: { Authorization: `Bearer ${params.token}` } } : {})
            };
            const response = await api.delete(`/products/${params.productId}/supplier`, config);
            return response.data;
        } catch (error: any) {
            if (typeof window !== 'undefined' && (!error.response || error.code === 'ERR_NETWORK')) {
                await db.syncQueue.add({
                    action: 'UPDATE',
                    resource: 'PRODUCT',
                    data: { ...params, id: params.productId, data: { supplierId: null } },
                    createdAt: Date.now()
                });
                return { success: true, offline: true };
            }
            throw error;
        }
    },
};
