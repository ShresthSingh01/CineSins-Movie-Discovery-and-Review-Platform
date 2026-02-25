import assert from 'assert';

// Mock localStorage
const storage = {
    allMovies: JSON.stringify([
        { id: '1', title: 'Action Hero', imdbRating: '9.5', metrics: { emotionalIntensity: 90, cognitiveLoad: 20, comfortScore: 30 } },
        { id: '2', title: 'Deep Thoughts', imdbRating: '9.4', metrics: { emotionalIntensity: 30, cognitiveLoad: 95, comfortScore: 20 } },
        { id: '3', title: 'Steady Life', imdbRating: '9.3', metrics: { emotionalIntensity: 20, cognitiveLoad: 30, comfortScore: 95 } },
        { id: '4', title: 'Random Fun', imdbRating: '6.0', metrics: { emotionalIntensity: 50, cognitiveLoad: 50, comfortScore: 50 } },
        { id: '5', title: 'Meh Movie', imdbRating: '5.5', metrics: { emotionalIntensity: 10, cognitiveLoad: 10, comfortScore: 10 } },
        { id: '6', title: 'Bad Flick', imdbRating: '3.0', metrics: { emotionalIntensity: 5, cognitiveLoad: 5, comfortScore: 5 } },
        { id: '7', title: 'Obscure Art', imdbRating: '4.5', metrics: { emotionalIntensity: 80, cognitiveLoad: 80, comfortScore: 10 } },
        { id: '8', title: 'Hidden Indie', imdbRating: '5.0', metrics: { emotionalIntensity: 40, cognitiveLoad: 40, comfortScore: 40 } },
        { id: '9', title: 'Cult Classic', imdbRating: '5.2', metrics: { emotionalIntensity: 60, cognitiveLoad: 60, comfortScore: 20 } },
        { id: '10', title: 'Experimental X', imdbRating: '4.8', metrics: { emotionalIntensity: 70, cognitiveLoad: 30, comfortScore: 30 } }
    ]),
    userProfile: JSON.stringify({ archetype: { id: 'comfort_watcher' } })
};

globalThis.localStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, val) => storage[key] = val,
};

if (!globalThis.crypto) {
    globalThis.crypto = { randomUUID: () => 'test-uuid' };
} else if (!globalThis.crypto.randomUUID) {
    globalThis.crypto.randomUUID = () => 'test-uuid';
}

import { decisionEngine } from '../src/decisionEngine.js';

console.log('Running Zero-Scroll Decision Mode tests...');

async function run() {
    // Test 1: Exactly 3 items
    const results = await decisionEngine({ mood: 'auto', epsilon: 0 });
    assert.strictEqual(results.length, 3, "Mode must return exactly 3 items");

    // Test 2: Exploration (Epsilon)
    let experimentalFound = false;
    for (let i = 0; i < 10; i++) {
        const res = await decisionEngine({ mood: 'auto', epsilon: 0.15 });
        if (res.some(m => m.explain.includes("Experimental"))) {
            experimentalFound = true;
            break;
        }
    }
    assert.ok(experimentalFound, "Should find at least one experimental pick within 10 spins at epsilon 0.15");

    console.log('Zero-Scroll tests passed! ⚠️🎯');
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
