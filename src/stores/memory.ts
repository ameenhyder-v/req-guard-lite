import type { ConsumeResult, RateLimitStore } from './types';

type MemoryStoreOptions = {
    windowMs: number;
    max: number;
    cleanupIntervalMs?: number;
};

type Record = {
    count: number;
    startTime: number;
};

export class MemoryStore implements RateLimitStore {
    private readonly windowMs: number;
    private readonly max: number;
    private readonly records = new Map<string, Record>();
    private cleanupTimer: ReturnType<typeof setInterval> | null = null;

    constructor(options: MemoryStoreOptions) {
        this.windowMs = options.windowMs;
        this.max = options.max;

        const cleanupIntervalMs = options.cleanupIntervalMs ?? 60_000;
        if (cleanupIntervalMs > 0) {
            this.cleanupTimer = setInterval(() => this.sweep(), cleanupIntervalMs);
            if (this.cleanupTimer.unref) {
                this.cleanupTimer.unref();
            }
        }
    }

    consume(key: string): ConsumeResult {
        const now = Date.now();
        const record = this.records.get(key);

        if (record && now - record.startTime > this.windowMs) {
            this.records.delete(key);
        }

        const existing = this.records.get(key);
        if (!existing) {
            this.records.set(key, { count: 1, startTime: now });
            return {
                allowed: true,
                totalHits: 1,
                resetTime: now + this.windowMs
            };
        }

        if (existing.count >= this.max) {
            return {
                allowed: false,
                totalHits: existing.count,
                resetTime: existing.startTime + this.windowMs
            };
        }

        existing.count++;
        return {
            allowed: true,
            totalHits: existing.count,
            resetTime: existing.startTime + this.windowMs
        };
    }

    private sweep(): void {
        const now = Date.now();
        for (const [key, record] of this.records) {
            if (now - record.startTime > this.windowMs) {
                this.records.delete(key);
            }
        }
    }
}
