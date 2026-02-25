/**
 * Regret Risk Index
 * Predicts the chance a user will regret choosing a movie based on their profile.
 */

const ARCHETYPE_PREFERENCES = {
    'emotional_purist': { emotionalIntensity: 85, cognitiveLoad: 50, comfortScore: 40 },
    'comfort_watcher': { emotionalIntensity: 30, cognitiveLoad: 20, comfortScore: 90 },
    'intellectual_explorer': { emotionalIntensity: 40, cognitiveLoad: 90, comfortScore: 30 },
    'adrenaline_seeker': { emotionalIntensity: 75, cognitiveLoad: 40, comfortScore: 30 },
    'nostalgia_lover': { emotionalIntensity: 50, cognitiveLoad: 40, comfortScore: 80 },
    'eclectic_dabbler': { emotionalIntensity: 55, cognitiveLoad: 55, comfortScore: 55 }
};

/**
 * Computes the regret score for a movie relative to a user profile.
 * @param {Object} movie Movie object with metrics and runtime
 * @param {Object} userProfile User profile with archetype and DNA stats
 * @returns {Object} { score, label, color, reason }
 */
export function computeRegretScore(movie, userProfile) {
    if (!movie || !movie.metrics || !userProfile || !userProfile.archetype) {
        return { score: 0, label: 'Low', color: '#10b981', reason: 'Not enough data' };
    }

    const m = movie.metrics;
    const pref = ARCHETYPE_PREFERENCES[userProfile.archetype.id] || ARCHETYPE_PREFERENCES['eclectic_dabbler'];
    const dna = userProfile.dna || {};

    // 1. Base Mismatch (0-1)
    // Weighted L1 distance
    const diffEmotional = Math.abs(m.emotionalIntensity - pref.emotionalIntensity) / 100;
    const diffCognitive = Math.abs(m.cognitiveLoad - pref.cognitiveLoad) / 100;
    const diffComfort = Math.abs(m.comfortScore - pref.comfortScore) / 100;

    // Adjust mismatch weights based on archetype
    let wE = 0.4, wC = 0.4, wF = 0.2;
    if (userProfile.archetype.id === 'intellectual_explorer') { wE = 0.2; wC = 0.6; wF = 0.2; }
    if (userProfile.archetype.id === 'comfort_watcher') { wE = 0.2; wC = 0.2; wF = 0.6; }

    const baseMismatch = (diffEmotional * wE) + (diffCognitive * wC) + (diffComfort * wF);

    // 2. Time Cost Factor (0-1)
    const userAvgRuntime = dna.avgRuntime || 100;
    const runtimeDiff = (movie.runtimeMin || 90) - userAvgRuntime;
    const timeCostFactor = 1 / (1 + Math.exp(-runtimeDiff / 30));

    // 3. Commitment Penalty (0-1)
    let commitmentPenalty = 0;
    const rewatchRate = dna.rewatchRate || 0.2;
    if (rewatchRate < 0.2 && (movie.runtimeMin || 90) > 130) {
        commitmentPenalty = Math.min(1, ((movie.runtimeMin || 90) - 130) / 100);
    }

    // regScoreRaw = baseMismatch * 0.7 + TimeCostFactor * 0.2 + CommitmentPenalty * 0.1
    // Let's make it more sensitive to high mismatch
    const rawScore = (baseMismatch * 0.75) + (timeCostFactor * 0.15) + (commitmentPenalty * 0.1);
    const score = Math.max(0, Math.min(1, rawScore));

    let label = 'Low';
    let color = '#10b981'; // Green
    if (score > 0.6) {
        label = 'High';
        color = '#ef4444'; // Red
    } else if (score > 0.3) {
        label = 'Medium';
        color = '#f59e0b'; // Yellow
    }

    // Generate Reason
    const reasonParts = [];
    if (baseMismatch > 0.4) reasonParts.push("Metric mismatch");
    if (timeCostFactor > 0.7) reasonParts.push(`Long runtime (${movie.runtimeMin}m)`);
    if (commitmentPenalty > 0.5) reasonParts.push("High commitment");

    const reason = reasonParts.length > 0 ? reasonParts.join(", ") : "Good match for your profile";

    return { score, label, color, reason };
}
