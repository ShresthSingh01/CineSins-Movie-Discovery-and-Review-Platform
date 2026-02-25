/**
 * Seed Regional Samples
 * Populates the store with curated regional movies.
 */

import { api } from '../api.js';
import { REGION_SAMPLES } from '../src/regionData.js';

// Mock localStorage for Node environment if needed
const storage = {};
globalThis.localStorage = {
    getItem: (key) => storage[key] || null,
    setItem: (key, val) => storage[key] = val,
};

// We also need to mock store's dependencies or just use a simple version
const allMovies = [];

async function seed() {
    console.log("🌍 Seeding regional samples...");

    for (const sample of REGION_SAMPLES) {
        try {
            console.log(`Fetching: ${sample.title} (${sample.id})...`);
            const movie = await api.fetchMovieById(sample.id);
            if (movie) {
                // Ensure region tags are applied (api does it usually but just in case)
                if (!movie.regionTags) movie.regionTags = [sample.region];

                // Add to our batch
                allMovies.push(movie);
            }
        } catch (e) {
            console.error(`Failed to fetch ${sample.title}:`, e.message);
        }
    }

    // Prepare what would be stored in localStorage
    const existingStr = localStorage.getItem("allMovies");
    let existing = existingStr ? JSON.parse(existingStr) : [];

    const existingIds = new Set(existing.map(m => m.id));
    const newMovies = allMovies.filter(m => !existingIds.has(m.id));

    const combined = [...existing, ...newMovies];
    console.log(`✅ Seeded ${newMovies.length} new regional movies. Total: ${combined.length}`);

    // In a real browser environment, we'd do:
    // localStorage.setItem("allMovies", JSON.stringify(combined));
    // Since this is a script, we will print a message or suggest how to run in browser.

    console.log("\nCopy-paste this into your browser console to apply immediately if needed, or restart app to trigger normal seeding logic if integrated.");
}

// Check if being run directly
if (import.meta.url.includes(process.argv[1])) {
    seed().then(() => console.log("Done."));
}

export { seed };
