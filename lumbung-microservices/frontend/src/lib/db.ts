import Dexie, { Table } from 'dexie';

export interface OfflineProduct {
    id: string;
    name: string;
    sku: string;
    sellingPrice: number;
    updatedAt: string;
}

export interface OfflineOrder {
    id?: number; // Auto-increment for local
    orderNumber: string;
    items: any[];
    synced: boolean;
    createdAt: Date;
}

export class LumbungDB extends Dexie {
    products!: Table<OfflineProduct>;
    orders!: Table<OfflineOrder>;

    constructor() {
        super('LumbungDB');
        this.version(1).stores({
            products: 'id, sku, name',
            orders: '++id, orderNumber, synced'
        });
    }
}

export const db = new LumbungDB();
