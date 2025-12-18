import { db } from './db';
import api from './api';

export class SyncService {
    static async syncOrders() {
        if (typeof window === 'undefined' || !db.salesOrders) return;

        try {
            // 1. Get unsynced orders from Dexie
            const unsyncedOrders = await db.salesOrders.filter(o => o.synced === false).toArray();

            if (unsyncedOrders.length === 0) return;

            for (const order of unsyncedOrders) {
                try {
                    // 2. Send to Backend
                    await api.post('/sales-orders', { // Updated endpoint
                        ...order,
                        // Ensure we don't send local ID or sync flag if backend doesn't want them
                        id: undefined,
                        synced: undefined
                    });

                    // 3. Mark as synced
                    await db.salesOrders.update(order.id!, { synced: true });
                    console.log(`Order ${order.orderNumber} synced successfully.`);

                } catch (error) {
                    console.error(`Failed to sync order ${order.orderNumber}:`, error);
                    // Retry logic could be added here
                }
            }
        } catch (error) {
            console.error("SyncService error:", error);
        }
    }

    // Polling or Trigger-based sync
    static startSync(intervalMs: number = 60000) {
        if (typeof window === 'undefined') return;

        // Run immediately on start
        if (navigator.onLine) {
            this.syncOrders();
        }

        setInterval(() => {
            if (navigator.onLine) {
                this.syncOrders();
            }
        }, intervalMs);
    }
}

