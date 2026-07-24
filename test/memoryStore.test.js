const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { MemoryStore } = require('../dist/stores/memory');

describe('MemoryStore', () => {
    it('allows requests under the limit', () => {
        const store = new MemoryStore();
        store.init({ windowMs: 60_000, max: 3 });

        const first = store.consume('user-a');
        assert.equal(first.allowed, true);
        assert.equal(first.totalHits, 1);
    });

    it('blocks requests that exceed the limit without incrementing', () => {
        const store = new MemoryStore();
        store.init({ windowMs: 60_000, max: 2 });

        assert.equal(store.consume('user-a').allowed, true);
        assert.equal(store.consume('user-a').allowed, true);

        const blocked = store.consume('user-a');
        assert.equal(blocked.allowed, false);
        assert.equal(blocked.totalHits, 2);

        const stillBlocked = store.consume('user-a');
        assert.equal(stillBlocked.allowed, false);
        assert.equal(stillBlocked.totalHits, 2);
    });

    it('resets the count after the window expires', async () => {
        const store = new MemoryStore();
        store.init({ windowMs: 50, max: 1 });

        assert.equal(store.consume('user-a').allowed, true);
        assert.equal(store.consume('user-a').allowed, false);

        await new Promise((resolve) => setTimeout(resolve, 60));

        assert.equal(store.consume('user-a').allowed, true);
        assert.equal(store.consume('user-a').totalHits, 1);
    });

    it('tracks keys independently', () => {
        const store = new MemoryStore();
        store.init({ windowMs: 60_000, max: 1 });

        assert.equal(store.consume('user-a').allowed, true);
        assert.equal(store.consume('user-b').allowed, true);
        assert.equal(store.consume('user-a').allowed, false);
        assert.equal(store.consume('user-b').allowed, false);
    });

    it('throws if consume is called before init', () => {
        const store = new MemoryStore();
        assert.throws(() => store.consume('user-a'), /must be initialized/);
    });
});
