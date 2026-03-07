// src/lib/regrisk.ts
import { Movie, RegretRisk } from './types';

const ARCHETYPE_PREFERENCES: Record<string, { emotionalIntensity: number, cognitiveLoad: number, comfortScore: number }> = {
    'emotional_purist': { emotionalIntensity: 85, cognitiveLoad: 50, comfortScore: 40 },
    'comfort_watcher': { emotionalIntensity: 30, cognitiveLoad: 20, comfortScore: 90 },
    'intellectual_explorer': { emotionalIntensity: 40, cognitiveLoad: 90, comfortScore: 30 },
    'adrenaline_seeker': { emotionalIntensity: 75, cognitiveLoad: 40, comfortScore: 30 },
    'nostalgia_lover': { emotionalIntensity: 50, cognitiveLoad: 40, comfortScore: 80 },
    'eclectic_dabbler': { emotionalIntensity: 55, cognitiveLoad: 55, comfortScore: 55 }
};

export function computeRegretScore(movie: Movie, userProfile: { archetype: { id: string }, dna: any }): RegretRisk {
    if (!movie || !movie.metrics || !userProfile || !userProfile.archetype) {
        return { score: 0, label: 'Low', color: '#10b981', reason: 'Not enough data' };
    }

    const m = movie.metrics;
    const pref = ARCHETYPE_PREFERENCES[userProfile.archetype.id] || ARCHETYPE_PREFERENCES['eclectic_dabbler'];

    const diffEmotional = Math.abs(m.emotionalIntensity - pref.emotionalIntensity) / 100;
    const diffCognitive = Math.abs(m.cognitiveLoad - pref.cognitiveLoad) / 100;
    const diffComfort = Math.abs(m.comfortScore - pref.comfortScore) / 100;

    let wE = 0.4, wC = 0.4, wF = 0.2;
    if (userProfile.archetype.id === 'intellectual_explorer') { wE = 0.2; wC = 0.6; wF = 0.2; }
    if (userProfile.archetype.id === 'comfort_watcher') { wE = 0.2; wC = 0.2; wF = 0.6; }

    const baseMismatch = (diffEmotional * wE) + (diffCognitive * wC) + (diffComfort * wF);

    const score = Math.max(0, Math.min(1, baseMismatch));

    let label: 'Low' | 'Medium' | 'High' = 'Low';
    let color = '#10b981';
    if (score > 0.6) {
        label = 'High';
        color = '#ef4444';
    } else if (score > 0.3) {
        label = 'Medium';
        color = '#f59e0b';
    }

    const reasonParts = [];
    if (baseMismatch > 0.4) reasonParts.push("Metric mismatch");

    const reason = reasonParts.length > 0 ? reasonParts.join(", ") : "Good match for your profile";

    return { score, label, color, reason };
}
