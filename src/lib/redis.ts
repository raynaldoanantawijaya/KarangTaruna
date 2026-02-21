import { Redis } from '@upstash/redis';

let redis: Redis;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
} else {
    console.warn('Upstash Redis: Missing environment variables. Redis features will be unavailable.');
    // Create a dummy proxy that fails gracefully at runtime instead of crashing at build time
    redis = new Proxy({} as Redis, {
        get: (_target, prop) => {
            if (typeof prop === 'string') {
                return (..._args: any[]) => {
                    console.warn(`Redis.${prop}() called but Redis is not configured.`);
                    return Promise.resolve(null);
                };
            }
        }
    });
}

export default redis;
