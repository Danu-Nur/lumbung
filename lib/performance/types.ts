export interface CacheStore {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(pattern?: string): Promise<void>;
}

export interface QueueJob<T = any> {
    id: string;
    name: string;
    data: T;
    attempts: number;
}

export interface QueueDriver {
    enqueue<T>(jobName: string, data: T, options?: { delay?: number }): Promise<string>;
    process(jobName: string, handler: (job: QueueJob) => Promise<void>): void;
}

export interface Worker {
    start(): Promise<void>;
    stop(): Promise<void>;
}
