const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { rateLimit } = require('../dist/index');

async function withServer(middleware, fn) {
    const app = express();
    app.use(middleware);
    app.get('/', (_req, res) => res.send('ok'));

    const server = app.listen(0);
    const { port } = server.address();

    try {
        await fn(`http://127.0.0.1:${port}`);
    } finally {
        await new Promise((resolve, reject) => {
            server.close((err) => (err ? reject(err) : resolve()));
        });
    }
}

describe('keyGenerator', () => {
    it('isolates limits per custom key', async () => {
        const limiter = rateLimit({
            max: 1,
            keyGenerator: (req) => req.headers['x-api-key'] || 'anonymous'
        });

        await withServer(limiter, async (baseUrl) => {
            const headersA = { 'x-api-key': 'key-a' };
            const headersB = { 'x-api-key': 'key-b' };

            assert.equal((await fetch(`${baseUrl}/`, { headers: headersA })).status, 200);
            assert.equal((await fetch(`${baseUrl}/`, { headers: headersB })).status, 200);
            assert.equal((await fetch(`${baseUrl}/`, { headers: headersA })).status, 429);
            assert.equal((await fetch(`${baseUrl}/`, { headers: headersB })).status, 429);
        });
    });

    it('uses IP-based keys by default', async () => {
        await withServer(rateLimit({ max: 1 }), async (baseUrl) => {
            assert.equal((await fetch(`${baseUrl}/`)).status, 200);
            assert.equal((await fetch(`${baseUrl}/`)).status, 429);
        });
    });
});
