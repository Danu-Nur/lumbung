import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisClient {
    private static instance: Redis;

    private constructor() { }

    public static getInstance(): Redis {
        if (!RedisClient.instance) {
            RedisClient.instance = new Redis(redisUrl, {
                maxRetriesPerRequest: null, // Critical for BullMQ
            });

            RedisClient.instance.on('error', (err) => {
                console.error('Redis Connection Error:', err);
            });

            RedisClient.instance.on('connect', () => {
                console.log('Successfully connected to Redis');
            });
        }
        return RedisClient.instance;
    }
}

export const redis = RedisClient.getInstance();
