import assert from 'assert';
import { computeRegretScore } from '../src/regrisk.js';

console.log('Running Regret Risk Index tests...');

const userProfile = {
    archetype: { id: 'comfort_watcher' },
    dna: { avgRuntime: 100, rewatchRate: 0.8 }
};

// Test 1: Matching movie to profile (Comfort Watcher + High Comfort Score) => Low
const movieA = {
    runtimeMin: 90,
    metrics: { emotionalIntensity: 30, cognitiveLoad: 20, comfortScore: 90 }
};
const riskA = computeRegretScore(movieA, userProfile);
assert.strictEqual(riskA.label, 'Low', `Expected Low risk for matching movie, got ${riskA.label}`);

// Test 2: Mismatched long movie (Comfort Watcher + High Intensity + Long Runtime) => High
const movieB = {
    runtimeMin: 180,
    metrics: { emotionalIntensity: 90, cognitiveLoad: 80, comfortScore: 20 }
};
const riskB = computeRegretScore(movieB, userProfile);
assert.strictEqual(riskB.label, 'High', `Expected High risk for mismatched long movie, got ${riskB.label}`);

// Test 3: Slightly different (Medium)
const movieC = {
    runtimeMin: 120,
    metrics: { emotionalIntensity: 60, cognitiveLoad: 50, comfortScore: 50 }
};
const riskC = computeRegretScore(movieC, userProfile);
assert.strictEqual(riskC.label, 'Medium', `Expected Medium risk for slightly different movie, got ${riskC.label}`);

console.log('Regret Risk tests passed! ⚠️');
