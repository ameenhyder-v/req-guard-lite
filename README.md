# req-guard 🛡️

A lightweight, zero-dependency rate limiter for Express APIs.

I built `req-guard` because I wanted a simple way to protect my API endpoints from spam and abuse without setting up complex stores like Redis. It uses an in-memory Map to track requests, making it perfect for small projects, prototypes, or services where you just need basic protection.

## Features

- 🚀 **Super Light:** No external database required (Redis, Memcached, etc.).
- 📦 **Zero Dependencies:** Keeps your project slim.
- 🛡️ **Easy Setup:** Drop it into your Express app in 2 lines of code.
- ʦ **TypeScript Ready:** Written in TypeScript with full type definitions included.

## Installation

```bash
npm install req-guard
```

## How to use

Import it and use it as middleware in your Express app.

```typescript
import express from 'express';
import { rateLimit } from 'req-guard';

const app = express();

// Create a limiter: Allow 100 requests every 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                 // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
});

// Apply to all requests
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

## Deployment Note (**Important!**)

If you deploy behind a proxy (like Nginx, AWS ELB, Heroku, or Cloudflare), you **must** tell Express to trust the proxy headers. Otherwise, all users will appear to come from the same IP address, and one person could block everyone!

Add this to your Express app setup:

```typescript
app.set('trust proxy', 1); // Trust the first proxy
```

## How It Works

`req-guard` stores a mapping of IP addresses to request counts in memory. 
1. When a request comes in, it checks the IP.
2. If the IP is new or the time window has expired, it resets the count.
3. If the count exceeds your `max` limit, it blocks the request with a 429 error.
4. Otherwise, it lets the request through.

**Note:** Since this stores data in memory, request counts will reset if you restart your server. For distributed systems (like multiple servers behind a load balancer), you would typically want a Redis-based solution, but for single-server apps, this works great!

## License

MIT © ameen_hyder

## Future Updates Roadmap

I am constantly working to improve `req-guard-lite`. Here is what you can expect in upcoming versions:

- **v0.2.0:** 📡 **Redis Support:** For distributed systems and scaling across multiple servers.
- **v0.3.0:** 🔑 **Custom Key Generators:** Rate limit by User ID, API Key, or any custom logic instead of just IP.
- **v0.4.0:** 📨 **Response Headers:** Standard headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) to keep clients informed.
- **v0.5.0:** 🪝 **Better Error Hooks:** Custom callback functions when a limit is reached (e.g., logging to an external service).

