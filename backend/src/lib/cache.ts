import { redis } from './redis.js';

export const cache = {
    /**
     * Get or set cache pattern
     */
    async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl: number = 3600): Promise<T> {
        if (process.env.ENABLE_REDIS_CACHE === 'false') {
            return await fetchFn();
        }

        try {
            const cached = await redis.get(key);
            if (cached) {
                return JSON.parse(cached) as T;
            }

            const freshData = await fetchFn();
            await redis.set(key, JSON.stringify(freshData), 'EX', ttl);
            return freshData;
        } catch (error) {
            console.error(`Cache Error for key ${key}:`, error);
            // Fallback to fresh data on cache failure (Graceful Degradation)
            return await fetchFn();
        }
    },

    /**
     * Invalidate specific key
     */
    async invalidate(key: string): Promise<void> {
        await redis.del(key);
    },

    /**
     * Invalidate by pattern (e.g. "tenant:123:*")
     */
    async invalidatePattern(pattern: string): Promise<void> {
        const stream = redis.scanStream({ match: pattern });
        stream.on('data', async (keys: string[]) => {
            if (keys.length) {
                await redis.del(...keys);
            }
        });
    }
};
