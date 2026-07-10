# req-guard-lite 🛡️

A lightweight rate limiter middleware for Express APIs with pluggable stores.

I built `req-guard-lite` because I wanted a simple way to protect API endpoints from spam and abuse. It defaults to an in-memory store (zero external dependencies), but supports Redis for distributed deployments and custom stores for any backend you need.

## Features

- 🚀 **Super Light:** In-memory by default — no external database required.
- 📦 **Zero Runtime Dependencies:** Only `express` as a peer dependency on the main import path.
- 📡 **Redis Support:** Optional `req-guard-lite/redis` subpath for multi-server deployments.
- 🔑 **Custom Key Generators:** Rate limit by IP, API key, user ID, or any custom logic.
- 🛡️ **Easy Setup:** Drop it into your Express app in 2 lines of code.
- ʦ **TypeScript Ready:** Written in TypeScript with full type definitions included.

## Installation

`express` is a **peer dependency** — install it alongside this package:

```bash
npm install req-guard-lite express
```

## Dependencies

| Kind | Package | Why |
|------|---------|-----|
| Peer | `express` (^4.18 or ^5) | You provide Express; this library is middleware only |
| Peer (optional) | `ioredis` (^5) | Only needed when using `req-guard-lite/redis` |
| Runtime | none | Zero bundled runtime dependencies on the main import |
| Dev only | `express`, `typescript`, `@types/*` | Used for building and testing this repo |

Dependency scanners may show `express` or `ioredis` as "missing" when analyzing `req-guard-lite` in isolation. That is expected — consumers install these in their own app.

## How to use

Import it and use it as middleware in your Express app.

```typescript
import express from 'express';
import { rateLimit } from 'req-guard-lite';

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});

app.use(limiter);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(3000);
```

## Configuration Options

|   Option    |   Type   |         Default        |                     Description                                                                    |
|:------------|----------|------------------------|----------------------------------------------------------------------------------------------------|
| `windowMs`  | `number` | `60000` (1 min)        | Time frame for which requests are checked/remembered (in milliseconds).                            |
|    `max`    | `number` | `undefined`            | **Required.** The maximum number of connections to allow during the `windowMs` before sending a 429|
| `message`   | `string` |`"Too many requests..."`| The error message sent in the response body when the limit is reached.                             |
| `statusCode`| `number` | `429`                  | The HTTP status code returned when the limit is reached.                                           |
| `keyGenerator` | `(req) => string` | IP address | Function that returns a unique key per client. See [Custom Key Generators](#custom-key-generators). |
| `store`     | `RateLimitStore` | `MemoryStore` | Storage backend for request counts. See [Stores](#stores). |

## Custom Key Generators

By default, requests are rate-limited by IP address. Use `keyGenerator` to limit by any identifier:

```typescript
import { rateLimit } from 'req-guard-lite';

const apiLimiter = rateLimit({
    max: 100,
    keyGenerator: (req) => (req.headers['x-api-key'] as string) ?? req.ip ?? 'anonymous'
});

const userLimiter = rateLimit({
    max: 50,
    keyGenerator: (req) => (req as any).user?.id ?? req.ip ?? 'anonymous'
});
```

## Stores

### In-Memory (default)

No setup required. Works out of the box for single-server apps and prototypes.

```typescript
import { rateLimit } from 'req-guard-lite';

const limiter = rateLimit({ max: 100, windowMs: 15 * 60 * 1000 });
```

### Redis (distributed)

For multiple servers behind a load balancer, use the Redis store so all instances share the same counters:

```bash
npm install req-guard-lite express ioredis
```

```typescript
import express from 'express';
import Redis from 'ioredis';
import { rateLimit } from 'req-guard-lite';
import { createRedisStore } from 'req-guard-lite/redis';

const app = express();
const redis = new Redis();

const windowMs = 15 * 60 * 1000;

const limiter = rateLimit({
    max: 100,
    windowMs,
    store: createRedisStore(redis, { windowMs, max: 100 })
});

app.use(limiter);
```

### Custom Store

Implement the `RateLimitStore` interface to use any backend (Memcached, DynamoDB, Postgres, etc.):

```typescript
import type { RateLimitStore, ConsumeResult } from 'req-guard-lite';

class MyStore implements RateLimitStore {
    consume(_key: string): ConsumeResult | Promise<ConsumeResult> {
        throw new Error('Not implemented');
    }
}

const limiter = rateLimit({ max: 100, store: new MyStore() });
```

## Deployment Note (**Important!**)

If you deploy behind a proxy (like Nginx, AWS ELB, Heroku, or Cloudflare), you **must** tell Express to trust the proxy headers. Otherwise, all users will appear to come from the same IP address, and one person could block everyone!

Add this to your Express app setup:

```typescript
app.set('trust proxy', 1);
```

## How It Works

`req-guard-lite` uses a pluggable store to track request counts per key (IP by default).

1. When a request comes in, `keyGenerator` produces a unique key.
2. The store checks whether the key is within the allowed limit for the current time window.
3. If the limit is exceeded, the request is blocked with a 429 error.
4. Otherwise, the request proceeds.

**In-memory store:** Perfect for single-server apps. Counts reset on server restart.

**Redis store:** Shares state across multiple server instances using atomic Lua scripts.

**Custom store:** Bring your own backend by implementing `RateLimitStore`.

## Security

See [SECURITY.md](./SECURITY.md) for vulnerability reporting.

## License

MIT © [Ameen Hyder](https://github.com/ameenhyder-v)

## Future Updates Roadmap

- ~~**v0.2.0:** Redis Support for distributed systems~~ ✅
- ~~**v0.3.0:** Custom Key Generators~~ ✅
- **v0.4.0:** 📨 **Response Headers:** Standard headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) to keep clients informed.
- **v0.5.0:** 🪝 **Better Error Hooks:** Custom callback functions when a limit is reached (e.g., logging to an external service).
