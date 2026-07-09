import type { KeyGenerator } from './keyGenerator';
import type { RateLimitStore } from './stores/types';

export type RateLimitOptions = {
    windowMs?: number;
    max: number;
    message?: string;
    statusCode?: number;
    keyGenerator?: KeyGenerator;
    store?: RateLimitStore;
};
