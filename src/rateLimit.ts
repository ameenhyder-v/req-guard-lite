import { Request, Response, NextFunction } from 'express';
import { RateLimitOptions } from './types';

export const rateLimit = (options: RateLimitOptions) => {
    const {
        windowMs = 60_000,
        max,
        message = 'Too many requests, please try again later.',
        statusCode = 429
    } = options;

    // closure based in memory storing request counts
    const requestCounts = new Map<string, {count: number, startTime: number}>();

    return (req: Request, res: Response, next: NextFunction) => {
        const key = req.ip || req.socket.remoteAddress || "unknown";
        const now = Date.now();

        const record = requestCounts.get(key);

        if (record && now - record.startTime > windowMs) {
            requestCounts.delete(key);
        }

        // Create new record if none exists
        if (!requestCounts.has(key)) {
            requestCounts.set(key, {count: 1, startTime: now});
            return next();  
        }

        const current = requestCounts.get(key)!;
        
        if (current.count >= max) {
            return res.status(statusCode).json({ message });
        }

        current.count++;
        next();
    };
};