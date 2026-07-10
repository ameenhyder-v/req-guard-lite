export type ConsumeResult = {
    allowed: boolean;
    totalHits: number;
    resetTime: number;
};

export interface RateLimitStore {
    consume(key: string): Promise<ConsumeResult> | ConsumeResult;
}
