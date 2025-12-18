import api from "@/lib/api";
import { db } from "@/lib/db";
import { CreateInventoryMovementParams } from "@/types/domain";

export const inventoryService = {
    /**
     * Creates an inventory movement.
     * Online: Calls API.
     * Offline: Updates local DB and adds to Sync Queue.
     */
    async createInventoryMovement(params: CreateInventoryMovementParams) {
        try {
            // 1. Try Online
            const response = await api.post('/inventory/movements', params);

            // 2. Update Local Cache on success (Mirroring server)
            await this._updateLocalInventory(params);

            return response.data;
        } catch (error: any) {
            const isOffline = !error.response || error.code === 'ERR_NETWORK';

            if (isOffline) {
                console.warn('Inventory: Offline Movement - Queued');

                // 1. Optimistic Update Local DB
                await this._updateLocalInventory(params);

                // 2. Queue for Sync
                await db.syncQueue.add({
                    action: 'CREATE',
                    resource: 'INVENTORY',
                    data: params,
                    createdAt: Date.now()
                });

                return {
                    id: `temp-${Date.now()}`,
                    ...params,
                    status: 'PENDING_SYNC'
                };
            }
            throw error;
        }
    },

    /**
     * Helper to update local Dexie state for inventory
     */
    async _updateLocalInventory(params: CreateInventoryMovementParams) {
        const { productId, warehouseId, quantity } = params;

        const item = await db.inventoryItems.where({ productId, warehouseId }).first();
        if (item) {
            await db.inventoryItems.update(item.id, {
                quantityOnHand: item.quantityOnHand + quantity,
                updatedAt: new Date().toISOString()
            });
        } else {
            // If item doesn't exist locally, we might need to fetch info or create placeholder
            // For now, create a basic entry if we have IDs
            await db.inventoryItems.add({
                id: `${productId}-${warehouseId}`,
                productId,
                warehouseId,
                quantityOnHand: quantity,
                updatedAt: new Date().toISOString()
            });
        }
    },

    /**
     * Get current stock for a product in a warehouse
     */
    async getStock(productId: string, warehouseId: string) {
        try {
            const response = await api.get('/inventory/stock', { params: { productId, warehouseId } });
            return response.data;
        } catch (error) {
            const item = await db.inventoryItems.where({ productId, warehouseId }).first();
            return item || null;
        }
    },

    /**
     * Get paginated inventory list
     */
    async getInventory(organizationId: string, page: number = 1, pageSize: number = 10, search: string = '') {
        try {
            const response = await api.get('/inventory', {
                params: { organizationId, page, pageSize, search }
            });

            // Background: Update local cache with latest data
            if (response.data.products) {
                await db.transaction('rw', db.products, db.inventoryItems, async () => {
                    for (const p of response.data.products) {
                        // Cache Product
                        await db.products.put({
                            id: p.id,
                            name: p.name,
                            sku: p.sku,
                            sellingPrice: Number(p.sellingPrice),
                            costPrice: Number(p.costPrice),
                            categoryId: p.categoryId,
                            organizationId: p.organizationId,
                            updatedAt: p.updatedAt
                        });

                        // Cache Inventory Items
                        if (p.inventoryItems) {
                            for (const inv of p.inventoryItems) {
                                await db.inventoryItems.put({
                                    id: inv.id,
                                    productId: p.id,
                                    warehouseId: inv.warehouseId,
                                    quantityOnHand: inv.quantityOnHand,
                                    updatedAt: inv.updatedAt
                                });
                            }
                        }
                    }
                });
            }

            return response.data;
        } catch (error) {
            console.warn('Inventory: Offline Fetch');

            let query = db.products.where({ organizationId });

            if (search) {
                // Dexie doesn't support complex OR search natively easily without full scan or mult-index
                // Simple filter for now
                query = query.filter(p =>
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    p.sku.toLowerCase().includes(search.toLowerCase())
                );
            }

            const count = await query.count();
            const products = await query
                .offset((page - 1) * pageSize)
                .limit(pageSize)
                .toArray();

            // Re-attach inventory items from local DB
            const productsWithInventory = await Promise.all(products.map(async p => {
                const inventoryItems = await db.inventoryItems.where({ productId: p.id }).toArray();
                return { ...p, inventoryItems };
            }));

            return { products: productsWithInventory, total: count };
        }
    },
};


