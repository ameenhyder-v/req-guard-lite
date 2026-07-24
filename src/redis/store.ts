import type { Redis } from 'ioredis';
import type { ConsumeResult, RateLimitStore, StoreInitOptions } from '../stores/types';

const CONSUME_SCRIPT = `
local key = KEYS[1]
local windowMs = tonumber(ARGV[1])
local max = tonumber(ARGV[2])

local count = redis.call('GET', key)
if count == false then
    redis.call('SET', key, 1, 'PX', windowMs)
    return {1, 1, windowMs}
end

local ttl = redis.call('PTTL', key)
if ttl <= 0 then
    redis.call('SET', key, 1, 'PX', windowMs)
    return {1, 1, windowMs}
end

count = tonumber(count)
if count >= max then
    return {0, count, ttl}
end

local newCount = redis.call('INCR', key)
return {1, newCount, ttl}
`;

export type RedisStoreOptions = {
    prefix?: string;
};

export const createRedisStore = (
    client: Redis,
    options: RedisStoreOptions = {}
): RateLimitStore => {
    const { prefix = 'req-guard:' } = options;
    let windowMs = 0;
    let max = 0;
    let initialized = false;

    return {
        init(initOptions: StoreInitOptions): void {
            windowMs = initOptions.windowMs;
            max = initOptions.max;
            initialized = true;
        },

        async consume(key: string): Promise<ConsumeResult> {
            if (!initialized) {
                throw new Error('RedisStore must be initialized via init() before consume()');
            }

            const redisKey = `${prefix}${key}`;
            const now = Date.now();
            const result = (await client.eval(
                CONSUME_SCRIPT,
                1,
                redisKey,
                windowMs,
                max
            )) as [number, number, number];

            const [allowed, totalHits, ttl] = result;

            return {
                allowed: allowed === 1,
                totalHits,
                resetTime: now + ttl
            };
        }
    };
};
