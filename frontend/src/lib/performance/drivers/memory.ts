import { CacheStore, QueueDriver, QueueJob } from "../types";

// --- Memory Cache ---
const cacheStorage = new Map<string, { value: any; expiry: number | null }>();

export class MemoryCache implements CacheStore {
    async get<T>(key: string): Promise<T | null> {
        const item = cacheStorage.get(key);
        if (!item) return null;

        if (item.expiry && Date.now() > item.expiry) {
            cacheStorage.delete(key);
            return null;
        }

        return item.value as T;
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
        cacheStorage.set(key, { value, expiry });
    }

    async delete(key: string): Promise<void> {
        cacheStorage.delete(key);
    }

    async clear(pattern?: string): Promise<void> {
        if (!pattern) {
            cacheStorage.clear();
            return;
        }
        // Simple substring match for pattern
        for (const key of Array.from(cacheStorage.keys())) {
            if (key.includes(pattern)) {
                cacheStorage.delete(key);
            }
        }
    }
}

// --- Inline Queue (Synchronous/Immediate) ---
// This driver executes jobs immediately when enqueued, blocking the request.
// Useful for development or simple deployments.
export class InlineQueue implements QueueDriver {
    private handlers = new Map<string, (job: QueueJob) => Promise<void>>();

    async enqueue<T>(jobName: string, data: T, options?: { delay?: number }): Promise<string> {
        const handler = this.handlers.get(jobName);

        // If delay is requested, we use setTimeout but this is "fire and forget" in a serverless context
        // which might be risky. But for "Inline" mode, we assume a long-running process or accept the risk.
        // Ideally, Inline = Immediate.

        const job: QueueJob<T> = {
            id: Math.random().toString(36).substring(7),
            name: jobName,
            data,
            attempts: 0,
        };

        if (options?.delay) {
            console.log(`[InlineQueue] Scheduling ${jobName} in ${options.delay}ms`);
            setTimeout(async () => {
                if (handler) {
                    try {
                        await handler(job);
                    } catch (err) {
                        console.error(`[InlineQueue] Job ${jobName} failed:`, err);
                    }
                } else {
                    console.warn(`[InlineQueue] No handler for ${jobName}`);
                }
            }, options.delay);
            return job.id;
        }

        // Immediate execution
        if (handler) {
            try {
                await handler(job);
            } catch (err) {
                console.error(`[InlineQueue] Job ${jobName} failed:`, err);
                // In inline mode, we might want to rethrow to let the caller know, 
                // but for queue semantics, we usually swallow errors and log them.
            }
        } else {
            console.warn(`[InlineQueue] No handler for ${jobName}`);
        }

        return job.id;
    }

    process(jobName: string, handler: (job: QueueJob) => Promise<void>): void {
        this.handlers.set(jobName, handler);
    }
}
