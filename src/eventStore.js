/**
 * Event Store
 * Persistent, append-only store for user behavioral events.
 */

export const eventStore = {
    STORAGE_KEY: 'cine_events',

    /**
     * Record a new event.
     * @param {string} type 'view' | 'rate' | 'review' | 'watchlist-add'
     * @param {string} movieId ID of the movie
     * @param {Object} metricsSnapshot Optional snapshot of movie metrics at time of event
     */
    async logEvent(type, movieId, metricsSnapshot = null, customTimestamp = null) {
        try {
            const events = this.getAllEvents();
            const newEvent = {
                id: crypto.randomUUID(),
                type,
                movieId,
                metricsSnapshot,
                timestamp: customTimestamp || Date.now()
            };
            events.push(newEvent);

            // Keep the log manageable but sufficient for trends (last 1000 events)
            if (events.length > 1000) events.shift();

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
            return newEvent;
        } catch (e) {
            console.error("Failed to log event:", e);
        }
    },

    /**
     * Retrieves all events.
     */
    getAllEvents() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    /**
     * Aggregate events into weekly buckets.
     * @param {number} weeksToLookBack Default 26
     */
    getWeeklyAggregates(weeksToLookBack = 26) {
        const events = this.getAllEvents();
        const now = Date.now();
        const MS_IN_WEEK = 7 * 24 * 60 * 60 * 1000;

        const buckets = Array.from({ length: weeksToLookBack }, (_, i) => ({
            weekStart: now - (weeksToLookBack - i) * MS_IN_WEEK,
            emotional: [],
            cognitive: [],
            comfort: [],
            count: 0
        }));

        events.forEach(ev => {
            const age = now - ev.timestamp;
            const weekIdx = weeksToLookBack - 1 - Math.floor(age / MS_IN_WEEK);

            if (weekIdx >= 0 && weekIdx < weeksToLookBack) {
                buckets[weekIdx].count++;
                if (ev.metricsSnapshot) {
                    buckets[weekIdx].emotional.push(ev.metricsSnapshot.emotionalIntensity || 50);
                    buckets[weekIdx].cognitive.push(ev.metricsSnapshot.cognitiveLoad || 50);
                    buckets[weekIdx].comfort.push(ev.metricsSnapshot.comfortScore || 50);
                }
            }
        });

        return buckets.map(b => ({
            ...b,
            avgEmotional: b.emotional.length ? b.emotional.reduce((a, b) => a + b, 0) / b.emotional.length : 50,
            avgCognitive: b.cognitive.length ? b.cognitive.reduce((a, b) => a + b, 0) / b.cognitive.length : 50,
            avgComfort: b.comfort.length ? b.comfort.reduce((a, b) => a + b, 0) / b.comfort.length : 50
        }));
    },

    /**
     * Compute trend insights.
     */
    computeTrends() {
        const weekly = this.getWeeklyAggregates(8); // Look at last 8 weeks for trend
        if (weekly.length < 4) return null;

        const latestMonth = weekly.slice(4);
        const prevMonth = weekly.slice(0, 4);

        const getAvg = (arr, key) => arr.reduce((sum, b) => sum + b[key], 0) / arr.length;

        const metrics = ['avgEmotional', 'avgCognitive', 'avgComfort'];
        const changes = {};

        metrics.forEach(m => {
            const current = getAvg(latestMonth, m);
            const prev = getAvg(prevMonth, m);
            changes[m] = prev === 0 ? 0 : ((current - prev) / prev) * 100;
        });

        return {
            weekly,
            changes,
            summary: this.generateTextualSummary(changes)
        };
    },

    generateTextualSummary(changes) {
        const significantThreshold = 15;
        if (Math.abs(changes.avgEmotional) > significantThreshold) {
            return `You've been watching ${changes.avgEmotional > 0 ? 'more intense' : 'calmer'} films lately.`;
        }
        if (Math.abs(changes.avgCognitive) > significantThreshold) {
            return `Your taste has shifted towards ${changes.avgCognitive > 0 ? 'higher' : 'lower'} cognitive load movies.`;
        }
        return "Your viewing patterns remain consistent.";
    }
};
