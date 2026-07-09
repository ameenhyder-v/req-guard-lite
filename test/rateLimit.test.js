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

describe('rateLimit', () => {
    it('allows requests under the limit', async () => {
        await withServer(rateLimit({ max: 3 }), async (baseUrl) => {
            const response = await fetch(`${baseUrl}/`);
            assert.equal(response.status, 200);
        });
    });

    it('blocks requests that exceed the limit', async () => {
        await withServer(rateLimit({ max: 2, message: 'slow down' }), async (baseUrl) => {
            assert.equal((await fetch(`${baseUrl}/`)).status, 200);
            assert.equal((await fetch(`${baseUrl}/`)).status, 200);

            const blocked = await fetch(`${baseUrl}/`);
            assert.equal(blocked.status, 429);

            const body = await blocked.json();
            assert.equal(body.message, 'slow down');
        });
    });

    it('resets the count after the window expires', async () => {
        await withServer(rateLimit({ max: 1, windowMs: 50 }), async (baseUrl) => {
            assert.equal((await fetch(`${baseUrl}/`)).status, 200);
            assert.equal((await fetch(`${baseUrl}/`)).status, 429);

            await new Promise((resolve) => setTimeout(resolve, 60));

            assert.equal((await fetch(`${baseUrl}/`)).status, 200);
        });
    });

    it('uses a custom status code when provided', async () => {
        await withServer(rateLimit({ max: 1, statusCode: 503 }), async (baseUrl) => {
            await fetch(`${baseUrl}/`);
            const blocked = await fetch(`${baseUrl}/`);
            assert.equal(blocked.status, 503);
        });
    });
});
