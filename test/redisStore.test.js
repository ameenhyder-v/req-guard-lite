const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const Redis = require('ioredis-mock');
const { createRedisStore } = require('../dist/redis');

describe('createRedisStore', () => {
    it('allows requests under the limit', async () => {
        const client = new Redis();
        const store = createRedisStore(client, {
            windowMs: 60_000,
            max: 3,
            prefix: 'test-allow:'
        });

        const first = await store.consume('user-a');
        assert.equal(first.allowed, true);
        assert.equal(first.totalHits, 1);
    });

    it('blocks requests that exceed the limit without incrementing', async () => {
        const client = new Redis();
        const store = createRedisStore(client, {
            windowMs: 60_000,
            max: 2,
            prefix: 'test-block:'
        });

        assert.equal((await store.consume('user-a')).allowed, true);
        assert.equal((await store.consume('user-a')).allowed, true);

        const blocked = await store.consume('user-a');
        assert.equal(blocked.allowed, false);
        assert.equal(blocked.totalHits, 2);

        const stillBlocked = await store.consume('user-a');
        assert.equal(stillBlocked.allowed, false);
        assert.equal(stillBlocked.totalHits, 2);
    });

    it('shares state across store instances using the same client', async () => {
        const client = new Redis();
        const options = { windowMs: 60_000, max: 2, prefix: 'test-shared:' };
        const storeA = createRedisStore(client, options);
        const storeB = createRedisStore(client, options);

        assert.equal((await storeA.consume('shared-key')).allowed, true);
        assert.equal((await storeB.consume('shared-key')).allowed, true);
        assert.equal((await storeA.consume('shared-key')).allowed, false);
        assert.equal((await storeB.consume('shared-key')).allowed, false);
    });

    it('resets the count after the window expires', async () => {
        const client = new Redis();
        const store = createRedisStore(client, {
            windowMs: 50,
            max: 1,
            prefix: 'test-reset:'
        });

        assert.equal((await store.consume('user-a')).allowed, true);
        assert.equal((await store.consume('user-a')).allowed, false);

        await new Promise((resolve) => setTimeout(resolve, 60));

        assert.equal((await store.consume('user-a')).allowed, true);
        assert.equal((await store.consume('user-a')).totalHits, 1);
    });
});
