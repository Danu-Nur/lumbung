import { db } from './db';
import api from './api';

export class SyncService {
    static isSyncing = false;

    /**
     * Main sync loop for the Queue
     */
    static async processQueue() {
        if (typeof window === 'undefined' || this.isSyncing) return;
        if (!navigator.onLine) return;

        this.isSyncing = true;
        console.log('[Sync] Processing sync queue...');

        try {
            const queueItems = await db.syncQueue.orderBy('createdAt').toArray();
            if (queueItems.length === 0) {
                this.isSyncing = false;
                return;
            }

            for (const item of queueItems) {
                try {
                    console.log(`[Sync] Syncing ${item.resource} ${item.action}...`);

                    let endpoint = '';
                    let method: 'post' | 'put' | 'delete' | 'patch' = 'post';
                    const data = { ...item.data };

                    switch (item.resource) {
                        case 'PRODUCT':
                            endpoint = item.action === 'CREATE' ? '/products' : `/products/${data.id}`;
                            method = item.action === 'CREATE' ? 'post' : item.action === 'UPDATE' ? 'put' : 'delete';
                            break;
                        case 'INVENTORY':
                            endpoint = '/inventory/adjustment'; // Defaulting to adjustment for now
                            method = 'post';
                            break;
                        case 'ORDER':
                        case 'PURCHASE_ORDER':
                            const isPurchaseOrder = item.resource === 'PURCHASE_ORDER' || data.type === 'PURCHASE';
                            endpoint = isPurchaseOrder ? '/purchase-orders' : '/orders';
                            method = 'post';
                            break;
                        case 'CUSTOMER':
                            endpoint = item.action === 'CREATE' ? '/customers' : `/customers/${data.id}`;
                            method = item.action === 'CREATE' ? 'post' : item.action === 'UPDATE' ? 'put' : 'delete';
                            break;
                        case 'SUPPLIER':
                            endpoint = item.action === 'CREATE' ? '/suppliers' : `/suppliers/${data.id}`;
                            method = item.action === 'CREATE' ? 'post' : item.action === 'UPDATE' ? 'put' : 'delete';
                            break;
                    }

                    if (endpoint) {
                        const config = data.token ? { headers: { Authorization: `Bearer ${data.token}` } } : {};

                        if (method === 'post') await api.post(endpoint, data, config);
                        else if (method === 'put') await api.put(endpoint, data, config);
                        else if (method === 'delete') await api.delete(endpoint, { ...config, data });

                        // Remove from queue on success
                        await db.syncQueue.delete(item.id!);

                        // Also update local record status if applicable
                        if (item.resource === 'ORDER' || item.resource === 'PURCHASE_ORDER') {
                            // Update local synced status (optional, since processQueue should be the primary)
                        }

                        console.log(`[Sync] ${item.resource} ${item.action} synced.`);
                    }
                } catch (error: any) {
                    console.error(`[Sync] Failed to sync item ${item.id}:`, error.response?.data || error.message);
                    // If it's a 4xx error (validation), it might never succeed, consider removing or flagging
                    if (error.response?.status >= 400 && error.response?.status < 500) {
                        console.warn('[Sync] Non-retryable error, removing from queue');
                        await db.syncQueue.delete(item.id!);
                    }
                    // Break loop to retry later for network/5xx
                    break;
                }
            }
        } catch (error) {
            console.error("[Sync] Queue processing error:", error);
        } finally {
            this.isSyncing = false;
        }
    }

    static startSync(intervalMs: number = 30000) {
        if (typeof window === 'undefined') return;

        // Run immediately
        this.processQueue();

        // Setup listeners
        window.addEventListener('online', () => {
            console.log('[Sync] Network back online, triggering sync...');
            this.processQueue();
        });

        // Polling
        setInterval(() => {
            this.processQueue();
        }, intervalMs);
    }
}
