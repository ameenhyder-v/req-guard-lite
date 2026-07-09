import type { Request, Response, NextFunction } from 'express';
import { ipKeyGenerator } from './keyGenerator';
import { MemoryStore } from './stores/memory';
import type { RateLimitOptions } from './types';

export const rateLimit = (options: RateLimitOptions) => {
    const {
        windowMs = 60_000,
        max,
        message = 'Too many requests, please try again later.',
        statusCode = 429,
        keyGenerator = ipKeyGenerator,
        store = new MemoryStore({ windowMs, max })
    } = options;

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const key = keyGenerator(req);
            const result = await Promise.resolve(store.consume(key));

            if (!result.allowed) {
                return res.status(statusCode).json({ message });
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};
