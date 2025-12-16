import { db, OfflineOrder } from './db';
import api from './api';

export class SyncService {
    static async syncOrders() {
        // 1. Get unsynced orders from Dexie
        const unsyncedOrders = await db.orders.filter(o => o.synced === false).toArray();

        if (unsyncedOrders.length === 0) return;

        for (const order of unsyncedOrders) {
            try {
                // 2. Send to Backend
                await api.post('/orders', {
                    orderNumber: order.orderNumber,
                    items: order.items,
                    // ... map other fields
                });

                // 3. Mark as synced
                await db.orders.update(order.id!, { synced: true });
                console.log(`Order ${order.orderNumber} synced successfully.`);

            } catch (error) {
                console.error(`Failed to sync order ${order.orderNumber}:`, error);
                // Retry logic could be added here
            }
        }
    }

    // Polling or Trigger-based sync
    static startSync(intervalMs: number = 60000) {
        setInterval(() => {
            if (navigator.onLine) {
                this.syncOrders();
            }
        }, intervalMs);
    }
}
