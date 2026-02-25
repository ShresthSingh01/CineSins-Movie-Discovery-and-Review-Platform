import assert from 'assert';
import { computeArchetype } from '../src/archetype.js';

console.log('Running Cinematic Archetype Model tests...');

// Profile A: High Emotional Intensity & High Rewatch Rate should be Emotional Purist
const statsA = {
    totalMoviesSaved: 10,
    avgEmotional: 85,
    avgCognitive: 50,
    avgComfort: 50,
    rewatchRate: 0.8,
    genreCounts: { 'Drama': 8, 'Romance': 2 },
    avgRating: "8.5"
};
const resultA = computeArchetype(statsA);
assert.strictEqual(resultA.id, 'emotional_purist', `Profile A should be emotional_purist, got ${resultA.id}`);

// Profile B: High Comfort Score & Short Runtimes should be Comfort Watcher
const statsB = {
    totalMoviesSaved: 10,
    avgEmotional: 30,
    avgCognitive: 30,
    avgComfort: 90,
    avgRuntime: 85,
    rewatchRate: 0.7,
    genreCounts: { 'Comedy': 5, 'Animation': 5 },
    avgRating: "7.0"
};
const resultB = computeArchetype(statsB);
assert.strictEqual(resultB.id, 'comfort_watcher', `Profile B should be comfort_watcher, got ${resultB.id}`);

// Profile C: High Cognitive Load & Hidden Gem Affinity should be Intellectual Explorer
const statsC = {
    totalMoviesSaved: 10,
    avgEmotional: 40,
    avgCognitive: 90,
    avgComfort: 30,
    hiddenGemAffinity: 8.5,
    genreCounts: { 'Sci-Fi': 6, 'Mystery': 4 },
    avgRating: "8.0"
};
const resultC = computeArchetype(statsC);
assert.strictEqual(resultC.id, 'intellectual_explorer', `Profile C should be intellectual_explorer, got ${resultC.id}`);

console.log('Archetype tests passed! 🧬');
