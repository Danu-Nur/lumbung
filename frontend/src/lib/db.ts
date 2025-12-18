import Dexie, { Table } from 'dexie';

export interface OfflineProduct {
    id: string;
    name: string;
    sku: string;
    sellingPrice: number;
    costPrice: number;
    categoryId?: string | null;
    organizationId: string;
    updatedAt: string;
    deletedAt?: string | null;
    barcode?: string | null;
    description?: string | null;
    supplierId?: string | null;
    unit?: string;
    lowStockThreshold?: number;
}

export interface OfflineCategory {
    id: string;
    name: string;
    organizationId: string;
}

export interface OfflineWarehouse {
    id: string;
    name: string;
    code: string;
    organizationId: string;
}

export interface OfflineSupplier {
    id: string;
    name: string;
    organizationId: string;
}

export interface OfflineCustomer {
    id: string;
    name: string;
    organizationId: string;
}

export interface OfflineInventoryItem {
    id: string;
    productId: string;
    warehouseId: string;
    quantityOnHand: number;
    updatedAt: string;
}

export interface OfflineOrder {
    id?: number; // Auto-increment for local
    orderNumber: string; // or 'DRAFT-...'
    customerId?: string;
    items: any[];
    total: number;
    status: string;
    synced: boolean; // true if already ON SERVER
    createdAt: string;
    organizationId: string;
}

export interface OfflinePurchaseOrder {
    id?: number;
    poNumber: string;
    supplierId: string;
    items: any[];
    total: number;
    status: string;
    synced: boolean;
    createdAt: string;
    organizationId: string;
}

// Queue for actions performed while offline
export interface SyncQueueItem {
    id?: number;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    resource: 'PRODUCT' | 'ORDER' | 'CUSTOMER' | 'SUPPLIER' | 'INVENTORY';
    data: any;
    createdAt: number;
}

export class LumbungDB extends Dexie {
    products!: Table<OfflineProduct>;
    categories!: Table<OfflineCategory>;
    warehouses!: Table<OfflineWarehouse>;
    suppliers!: Table<OfflineSupplier>;
    customers!: Table<OfflineCustomer>;
    inventoryItems!: Table<OfflineInventoryItem>;
    salesOrders!: Table<OfflineOrder>; // Renamed from orders for clarity
    purchaseOrders!: Table<OfflinePurchaseOrder>;
    syncQueue!: Table<SyncQueueItem>;

    constructor() {
        super('LumbungDB');
        this.version(2).stores({
            products: 'id, sku, name, organizationId',
            categories: 'id, name, organizationId',
            warehouses: 'id, name, organizationId',
            suppliers: 'id, name, organizationId',
            customers: 'id, name, organizationId',
            inventoryItems: 'id, [productId+warehouseId], productId, warehouseId',
            salesOrders: '++id, orderNumber, status, synced, organizationId',
            purchaseOrders: '++id, poNumber, status, synced, organizationId',
            syncQueue: '++id, action, resource, createdAt'
        }).upgrade(tx => {
            // Migration logic if needed, data preservation
        });
    }
}

// Safe initialization for Next.js (Server Side)
export const db = typeof window !== 'undefined' ? new LumbungDB() : {} as LumbungDB;
