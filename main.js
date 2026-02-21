import { ui } from './ui.js';
import { api } from './api.js';
import { decisionEngine } from './store.js';

window.addEventListener('DOMContentLoaded', () => {
    ui.init();

    // Expose api to the console for testing
    window.api = api;
    window.decisionEngine = decisionEngine;
    console.log("Modules loaded successfully! 🚀");
    console.log("You can test the API and Decision Engine in the console.");

    // Unit test demonstrating it returns a normalized movie object array with explanations
    (async function runTest() {
        console.log("--- Running Decision Engine Unit Test ---");
        const recommendations = await decisionEngine({ mood: 'Comfort', time: 90, company: 'Alone' });
        console.log("Recommendations for {mood:'Comfort', time:90, company:'Alone'}:");
        recommendations.forEach((rec, i) => {
            console.log(`${i + 1}. ${rec.title} - ${rec.explain}`);
            console.log(rec);
        });
        console.log("--------------------------");

        console.log("--- Running computeMetrics Unit Test ---");
        const sampleMovie = { genres: "Drama, Romance", runtime: "120 min", imdbRating: "8.2" };
        const metrics = api.computeMetrics(sampleMovie);
        console.log(`Metrics for Genres: "Drama, Romance", Runtime: "120 min", imdbRating: "8.2":`);
        console.log(`Emotional Intensity: ${metrics.emotionalIntensity} (Expected >= 70)`);
        console.log(`Cognitive Load: ${metrics.cognitiveLoad}`);
        console.log(`Comfort Score: ${metrics.comfortScore}`);
        console.log("--------------------------");

        console.log("--- Running Scene Tags Unit Test ---");
        const { store } = await import('./store.js');
        const testMovieId = "tt1375666"; // Inception
        store.addTag(testMovieId, "dream");
        store.addTag(testMovieId, "heist");
        const tags = store.getTags(testMovieId);
        console.log(`Tags for ${testMovieId}:`, tags);
        const exported = store.exportTags();
        console.log("Exported JSON structure:", exported);
        console.log("Contains mapping for movie id?", exported.includes(`"${testMovieId}"`));
        console.log("--------------------------");

        console.log("--- Running Hidden Gems Unit Test ---");
        // Ensure cache is seeded
        if (store.getAllMovies().length < 50) {
            await store.seedMoviesIfNeeded();
        }
        const gems = store.getHiddenGems();
        console.log(`Top Hidden Gems extracted (${gems.length} elements):`);
        gems.slice(0, 3).forEach((g, i) => {
            console.log(`${i + 1}. ${g.title || g.Title} - Rating: ${g.imdbRating}, Votes: ${g.imdbVotes} -> HiddenScore: ${g.hiddenScore.toFixed(2)}`);
        });
        console.log("--------------------------");
    })();
});
