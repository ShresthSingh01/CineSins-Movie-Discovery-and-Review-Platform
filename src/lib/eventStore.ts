// src/lib/eventStore.ts
import { MovieMetrics } from './types';
import { safeLocalStorage } from './storage';

export interface CineEvent {
    id: string;
    type: 'view' | 'rate' | 'review' | 'watchlist-add';
    movieId: string;
    metricsSnapshot: MovieMetrics | null;
    timestamp: number;
}

export const eventStore = {
    STORAGE_KEY: 'cine_events',

    async logEvent(type: CineEvent['type'], movieId: string, metricsSnapshot: MovieMetrics | null = null, customTimestamp: number | null = null) {
        try {
            const events = this.getAllEvents();
            const newEvent: CineEvent = {
                id: crypto.randomUUID(),
                type,
                movieId,
                metricsSnapshot,
                timestamp: customTimestamp || Date.now()
            };
            events.push(newEvent);

            if (events.length > 1000) events.shift();

            safeLocalStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
            return newEvent;
        } catch (e) {
            console.error("Failed to log event:", e);
        }
    },

    getAllEvents(): CineEvent[] {
        try {
            const data = safeLocalStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    getWeeklyAggregates(weeksToLookBack = 26) {
        const events = this.getAllEvents();
        const now = Date.now();
        const MS_IN_WEEK = 7 * 24 * 60 * 60 * 1000;

        const buckets = Array.from({ length: weeksToLookBack }, (_, i) => ({
            weekStart: now - (weeksToLookBack - i) * MS_IN_WEEK,
            emotional: [] as number[],
            cognitive: [] as number[],
            comfort: [] as number[],
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

    computeTrends() {
        const weekly = this.getWeeklyAggregates(8);
        if (weekly.length < 4) return null;

        const latestMonth = weekly.slice(4);
        const prevMonth = weekly.slice(0, 4);

        const getAvg = (arr: any[], key: string) => arr.reduce((sum, b) => sum + b[key], 0) / arr.length;

        const metrics = ['avgEmotional', 'avgCognitive', 'avgComfort'];
        const changes: Record<string, number> = {};

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

    generateTextualSummary(changes: Record<string, number>) {
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
