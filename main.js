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
    })();
});
