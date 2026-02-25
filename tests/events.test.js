import assert from 'assert';
// Mock localStorage
const storage = {};
globalThis.localStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, val) => storage[key] = val,
    clear: () => { for (let key in storage) delete storage[key]; }
};

if (!globalThis.crypto) {
    globalThis.crypto = { randomUUID: () => 'test-uuid' };
} else if (!globalThis.crypto.randomUUID) {
    globalThis.crypto.randomUUID = () => 'test-uuid';
}

import { eventStore } from '../src/eventStore.js';

console.log('Running Behavioral Events tests...');

// Test 1: Logging Event
await eventStore.logEvent('view', 'tt123', { emotionalIntensity: 80 });
const events = eventStore.getAllEvents();
assert.strictEqual(events.length, 1);
assert.strictEqual(events[0].type, 'view');
assert.strictEqual(events[0].metricsSnapshot.emotionalIntensity, 80);

// Test 2: Aggregate formatting
const aggregation = eventStore.getWeeklyAggregates(4);
assert.strictEqual(aggregation.length, 4);
assert.ok(aggregation[3].count >= 1);

console.log('Behavioral Events tests passed! 📝');
