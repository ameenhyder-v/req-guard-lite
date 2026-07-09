import type { Request } from 'express';

export type KeyGenerator = (req: Request) => string;

export const ipKeyGenerator: KeyGenerator = (req) =>
    req.ip || req.socket.remoteAddress || 'unknown';
