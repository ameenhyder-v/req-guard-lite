export type ConsumeResult = {
    allowed: boolean;
    totalHits: number;
    resetTime: number;
};

export type StoreInitOptions = {
    windowMs: number;
    max: number;
};

export interface RateLimitStore {
    init?(options: StoreInitOptions): void;
    consume(key: string): Promise<ConsumeResult> | ConsumeResult;
}
