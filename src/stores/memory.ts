import type { ConsumeResult, RateLimitStore, StoreInitOptions } from './types';

type MemoryStoreOptions = {
    cleanupIntervalMs?: number;
};

type Record = {
    count: number;
    startTime: number;
};

export class MemoryStore implements RateLimitStore {
    private windowMs = 0;
    private max = 0;
    private initialized = false;
    private readonly records = new Map<string, Record>();
    private cleanupTimer: ReturnType<typeof setInterval> | null = null;
    private readonly cleanupIntervalMs: number;

    constructor(options: MemoryStoreOptions = {}) {
        this.cleanupIntervalMs = options.cleanupIntervalMs ?? 60_000;
    }

    init(options: StoreInitOptions): void {
        this.windowMs = options.windowMs;
        this.max = options.max;
        this.initialized = true;

        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }

        if (this.cleanupIntervalMs > 0) {
            this.cleanupTimer = setInterval(() => this.sweep(), this.cleanupIntervalMs);
            if (this.cleanupTimer.unref) {
                this.cleanupTimer.unref();
            }
        }
    }

    consume(key: string): ConsumeResult {
        if (!this.initialized) {
            throw new Error('MemoryStore must be initialized via init() before consume()');
        }

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
        if (!this.initialized) {
            return;
        }

        const now = Date.now();
        for (const [key, record] of this.records) {
            if (now - record.startTime > this.windowMs) {
                this.records.delete(key);
            }
        }
    }
}
