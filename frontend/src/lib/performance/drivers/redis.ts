import Redis from "ioredis";
import { Queue, Worker as BullWorker, Job } from "bullmq";
import { CacheStore, QueueDriver, QueueJob, Worker } from "../types";

// Shared Redis connection for Cache
// We use a singleton pattern to avoid too many connections
let redisClient: Redis | null = null;

function getRedisClient() {
    if (!redisClient) {
        redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
    }
    return redisClient;
}

// --- Redis Cache ---
export class RedisCache implements CacheStore {
    private client: Redis;

    constructor() {
        this.client = getRedisClient();
    }

    async get<T>(key: string): Promise<T | null> {
        const data = await this.client.get(key);
        if (!data) return null;
        try {
            return JSON.parse(data) as T;
        } catch {
            return data as unknown as T;
        }
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        const serialized = typeof value === "string" ? value : JSON.stringify(value);
        if (ttlSeconds) {
            await this.client.set(key, serialized, "EX", ttlSeconds);
        } else {
            await this.client.set(key, serialized);
        }
    }

    async delete(key: string): Promise<void> {
        await this.client.del(key);
    }

    async clear(pattern?: string): Promise<void> {
        if (!pattern) {
            await this.client.flushdb();
            return;
        }

        // Scan and delete (careful in production with large keyspaces)
        const stream = this.client.scanStream({ match: pattern });
        stream.on("data", (keys) => {
            if (keys.length) {
                const pipeline = this.client.pipeline();
                keys.forEach((key: string) => pipeline.del(key));
                pipeline.exec();
            }
        });
    }
}

// --- Redis Queue (BullMQ) ---
export class RedisQueue implements QueueDriver {
    private queues = new Map<string, Queue>();
    private workers = new Map<string, BullWorker>();

    private getQueue(name: string): Queue {
        if (!this.queues.has(name)) {
            const connection = getRedisClient();
            // Reuse connection logic or pass connection options
            // BullMQ creates its own connections usually, but we can pass existing ioredis instance
            // actually BullMQ recommends passing connection config
            this.queues.set(name, new Queue(name, { connection }));
        }
        return this.queues.get(name)!;
    }

    async enqueue<T>(jobName: string, data: T, options?: { delay?: number }): Promise<string> {
        const queue = this.getQueue(jobName); // We use jobName as queue name for simplicity, or we could have a single "default" queue
        // For this implementation, let's map "jobName" to the Queue Name, and job name inside is 'default'
        // OR: Single "LumbungQueue" and job names vary.
        // Let's go with: jobName IS the queue name (e.g. "email", "reports")

        const job = await queue.add("process", data, {
            delay: options?.delay,
            removeOnComplete: 100, // Keep last 100
            removeOnFail: 500,
        });

        return job.id || "";
    }

    process(jobName: string, handler: (job: QueueJob) => Promise<void>): void {
        // In Redis mode, 'process' might be called by a separate worker script.
        // But if we run this in the main app (not recommended for heavy load but ok for simple),
        // we can start a worker here.

        if (this.workers.has(jobName)) return;

        const connection = getRedisClient();
        const worker = new BullWorker(jobName, async (bullJob: Job) => {
            const jobWrapper: QueueJob = {
                id: bullJob.id || "",
                name: jobName,
                data: bullJob.data,
                attempts: bullJob.attemptsMade,
            };
            await handler(jobWrapper);
        }, { connection });

        this.workers.set(jobName, worker);
    }
}
