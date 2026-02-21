import { ui } from './ui.js';
import { api } from './api.js';

window.addEventListener('DOMContentLoaded', () => {
    ui.init();

    // Expose api to the console for testing
    window.api = api;
    console.log("Modules loaded successfully! 🚀");
    console.log("You can test the API in the console, e.g.: await api.fetchMovieByTitle('Inception')");

    // Small test demonstrating it returns a normalized movie object
    (async function runTest() {
        console.log("--- Running Small Test ---");
        const movie = await api.fetchMovieByTitle('Inception');
        console.log("Normalized Movie Object for 'Inception':", movie);
        console.log("--------------------------");
    })();
});
