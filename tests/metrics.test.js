import assert from 'assert';
import { normalizeMovieData } from '../store.js';

console.log('Running metrics tests...');

// Mock movies
const inception = {
    title: "Inception",
    genres: "Action, Adventure, Sci-Fi, Thriller",
    runtime: "148 min",
    imdbRating: "8.8"
};

const toyStory = {
    title: "Toy Story",
    genres: "Animation, Adventure, Comedy, Family",
    runtime: "81 min",
    imdbRating: "8.3"
};

const notebook = {
    title: "The Notebook",
    genres: "Drama, Romance",
    runtime: "123 min",
    imdbRating: "7.8"
};

const normInception = normalizeMovieData({ ...inception });
const normToyStory = normalizeMovieData({ ...toyStory });
const normNotebook = normalizeMovieData({ ...notebook });

// Assertion 1: Check normalized fields
assert.strictEqual(normInception.runtimeMin, 148, "Inception runtime parsed incorrectly");
assert.strictEqual(normToyStory.imdbRatingFloat, 8.3, "Toy Story rating parsed incorrectly");
assert.deepStrictEqual(normNotebook.normalizedGenres, ["Drama", "Romance"], "Notebook genres parsed incorrectly");

// Assertion 2: Metrics Exist
assert.ok(normInception.metrics.emotionalIntensity, "Inception missing intensity metric");
assert.ok(normToyStory.metrics.comfortScore, "Toy Story missing comfort score");

// Assertion 3: Ordering constraints matching prompt requirements
// "comfortScore(Toy Story) > comfortScore(Inception)"
assert.ok(
    normToyStory.metrics.comfortScore > normInception.metrics.comfortScore,
    `Expected Toy Story comfort (${normToyStory.metrics.comfortScore}) > Inception comfort (${normInception.metrics.comfortScore})`
);

// "emotionalIntensity(Inception) > emotionalIntensity(Toy Story)"
assert.ok(
    normInception.metrics.emotionalIntensity > normToyStory.metrics.emotionalIntensity,
    `Expected Inception intensity (${normInception.metrics.emotionalIntensity}) > Toy Story intensity (${normToyStory.metrics.emotionalIntensity})`
);

// "cognitiveLoad(Inception) > cognitiveLoad(The Notebook)"
assert.ok(
    normInception.metrics.cognitiveLoad > normNotebook.metrics.cognitiveLoad,
    `Expected Inception load (${normInception.metrics.cognitiveLoad}) > Notebook load (${normNotebook.metrics.cognitiveLoad})`
);

console.log('All metrics tests passed! 🚀');
