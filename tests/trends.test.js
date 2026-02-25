import assert from 'assert';
// Mock localStorage
const storage = {};
globalThis.localStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, val) => storage[key] = val,
};

if (!globalThis.crypto) {
    globalThis.crypto = { randomUUID: () => 'test-uuid' };
} else if (!globalThis.crypto.randomUUID) {
    globalThis.crypto.randomUUID = () => 'test-uuid';
}

import { eventStore } from '../src/eventStore.js';

console.log('Running Trends Aggregator tests...');

// Mock data: 8 weeks of data
const MS_IN_WEEK = 7 * 24 * 60 * 60 * 1000;
const now = Date.now();

// Month 1: Low Intensity (avg 20)
for (let i = 0; i < 5; i++) {
    const timestamp = now - (6 * MS_IN_WEEK);
    eventStore.logEvent('view', 'm1', { emotionalIntensity: 20 }, timestamp);
}

// Month 2: High Intensity (avg 80)
for (let i = 0; i < 5; i++) {
    const timestamp = now - (1 * MS_IN_WEEK);
    eventStore.logEvent('view', 'm2', { emotionalIntensity: 80 }, timestamp);
}

const trends = eventStore.computeTrends();
assert.ok(trends.changes.avgEmotional > 0, "Expected positive emotional trend");
assert.ok(trends.summary.includes("more intense"), "Summary should reflect intensity increase");

console.log('Trends Aggregator tests passed! 📈');
