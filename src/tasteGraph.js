/**
 * TasteGraph - Privacy-first CinemaDNA sharing and comparison.
 */

/**
 * Creates an anonymous taste card for sharing.
 */
export function exportTasteCard(analytics, displayName = "Secret Cinephile") {
    if (!analytics) return null;

    return {
        v: 1, // Version
        name: displayName,
        metrics: {
            ei: analytics.avgEmotional || 50,
            cl: analytics.avgCognitive || 50,
            cs: analytics.avgComfort || 50
        },
        genres: analytics.genreCounts || {},
        ts: Date.now()
    };
}

/**
 * Computes similarity between two taste cards.
 * Returns { score, matches: [], divergences: [] }
 */
export function compareTasteCards(cardA, cardB) {
    if (!cardA || !cardB) return { score: 0, matches: [], divergences: [] };

    // 1. Metric Similarity (0.4 weight)
    const vecA_m = [cardA.metrics.ei, cardA.metrics.cl, cardA.metrics.cs];
    const vecB_m = [cardB.metrics.ei, cardB.metrics.cl, cardB.metrics.cs];
    const metricSim = cosineSimilarity(vecA_m, vecB_m);

    // 2. Genre Similarity (0.6 weight)
    const allGenres = new Set([...Object.keys(cardA.genres), ...Object.keys(cardB.genres)]);
    const vecA_g = [];
    const vecB_g = [];

    allGenres.forEach(g => {
        vecA_g.push(cardA.genres[g] || 0);
        vecB_g.push(cardB.genres[g] || 0);
    });

    const genreSim = cosineSimilarity(vecA_g, vecB_g);

    const finalScore = Math.round(((metricSim * 0.4) + (genreSim * 0.6)) * 100);

    // 3. Shared & Divergent Genres
    const shared = [];
    const divA = [];
    const divB = [];

    allGenres.forEach(g => {
        const countA = cardA.genres[g] || 0;
        const countB = cardB.genres[g] || 0;

        if (countA > 0 && countB > 0) {
            shared.push({ g, weight: countA + countB });
        } else if (countA > 0) {
            divA.push({ g, weight: countA });
        } else if (countB > 0) {
            divB.push({ g, weight: countB });
        }
    });

    const matches = shared.sort((a, b) => b.weight - a.weight).slice(0, 3).map(x => x.g);

    // Divergences: unique to one side, sorted by weight
    const rawDivergences = [...divA, ...divB].sort((a, b) => b.weight - a.weight);
    const divergences = Array.from(new Set(rawDivergences.map(x => x.g))).slice(0, 3);

    return {
        score: Math.max(0, Math.min(100, finalScore)),
        matches,
        divergences,
        names: { a: cardA.name, b: cardB.name }
    };
}

/**
 * Helper: Cosine Similarity
 */
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    const mag = (Math.sqrt(normA) * Math.sqrt(normB));
    return mag === 0 ? 0 : dotProduct / mag;
}
