import { QueueDriver } from "./types";
import { InlineQueue } from "./drivers/memory";
import { RedisQueue } from "./drivers/redis";

let queueInstance: QueueDriver | null = null;

export function getQueue(): QueueDriver {
    if (queueInstance) return queueInstance;

    const driver = process.env.QUEUE_DRIVER || "inline";

    if (driver === "redis" && process.env.FEATURE_PERF_QUEUE === "true") {
        console.log("[Performance] Using Redis Queue");
        queueInstance = new RedisQueue();
    } else {
        if (driver === "redis") {
            console.warn("[Performance] QUEUE_DRIVER=redis but FEATURE_PERF_QUEUE is disabled. Falling back to inline.");
        } else {
            console.log("[Performance] Using Inline Queue");
        }
        queueInstance = new InlineQueue();
    }

    return queueInstance;
}
