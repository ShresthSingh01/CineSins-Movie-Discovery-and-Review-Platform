/**
 * Seed Script: Long-Term Behavior Events
 * Generates 40 events across 12 weeks to test Trends visualization.
 */

(function seed() {
    const STORAGE_KEY = 'cine_events';
    const now = Date.now();
    const MS_IN_WEEK = 7 * 24 * 60 * 60 * 1000;
    const events = [];

    console.log("Seeding behavioral events...");

    for (let i = 0; i < 40; i++) {
        // Spread events over 12 weeks
        const weeksAgo = Math.floor(Math.random() * 12);
        const timestamp = now - (weeksAgo * MS_IN_WEEK) - (Math.random() * MS_IN_WEEK);

        // Pattern: Intensity starts low and increases
        const intensityBase = 20 + ((12 - weeksAgo) * 5); // Higher recently
        const cogLoadBase = 60 - ((12 - weeksAgo) * 2);   // Lower recently

        events.push({
            id: `seed-${i}`,
            type: i % 3 === 0 ? 'review' : i % 3 === 1 ? 'watchlist-add' : 'view',
            movieId: `tt${1000000 + i}`,
            metricsSnapshot: {
                emotionalIntensity: Math.min(100, intensityBase + (Math.random() * 20)),
                cognitiveLoad: Math.max(0, cogLoadBase + (Math.random() * 20)),
                comfortScore: Math.random() * 100
            },
            timestamp
        });
    }

    // Sort by timestamp for consistency
    events.sort((a, b) => a.timestamp - b.timestamp);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    console.log("Seeding complete! 40 events stored for Trends analysis.");
})();
