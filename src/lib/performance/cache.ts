import { CacheStore } from "./types";
import { MemoryCache } from "./drivers/memory";
import { RedisCache } from "./drivers/redis";

let cacheInstance: CacheStore | null = null;

export function getCache(): CacheStore {
    if (cacheInstance) return cacheInstance;

    const driver = process.env.CACHE_DRIVER || "memory";

    if (driver === "redis" && process.env.FEATURE_PERF_CACHE === "true") {
        console.log("[Performance] Using Redis Cache");
        cacheInstance = new RedisCache();
    } else {
        if (driver === "redis") {
            console.warn("[Performance] CACHE_DRIVER=redis but FEATURE_PERF_CACHE is disabled. Falling back to memory.");
        } else {
            console.log("[Performance] Using Memory Cache");
        }
        cacheInstance = new MemoryCache();
    }

    return cacheInstance;
}
