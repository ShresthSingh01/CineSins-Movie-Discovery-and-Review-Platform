/**
 * Cinematic Archetype Model
 * Classifies users into 6 distinct personas based on their CinemaDNA metrics.
 */

export const ARCHETYPES = {
    EMOTIONAL_PURIST: {
        id: 'emotional_purist',
        label: 'Emotional Purist',
        description: 'You seek movies that make you feel deeply, valuing emotional resonance over spectacle.',
        icon: 'fa-heart',
        traits: ['Highly Empathic', 'Drama Enthusiast', 'Character-Driven']
    },
    COMFORT_WATCHER: {
        id: 'comfort_watcher',
        label: 'Comfort Watcher',
        description: 'Movies are your safe haven. You value familiarity, warmth, and easy-to-digest narratives.',
        icon: 'fa-couch',
        traits: ['Safety-Seeker', 'Rewatch Specialist', 'Light-Hearted']
    },
    INTELLECTUAL_EXPLORER: {
        id: 'intellectual_explorer',
        label: 'Intellectual Explorer',
        description: 'You crave complexity and hidden meanings, often digging for underground masterpieces.',
        icon: 'fa-brain',
        traits: ['Analytical', 'Cinephile', 'Growth-Oriented']
    },
    ADRENALINE_SEEKER: {
        id: 'adrenaline_seeker',
        label: 'Adrenaline Seeker',
        description: 'You live for the thrill. Fast plots, high stakes, and intense action are your fuel.',
        icon: 'fa-bolt',
        traits: ['High Energy', 'Thrill-Seeker', 'Action-Oriented']
    },
    NOSTALGIA_LOVER: {
        id: 'nostalgia_lover',
        label: 'Nostalgia Lover',
        description: 'You believe they "don\'t make them like they used to." Your heart belongs to the classics.',
        icon: 'fa-history',
        traits: ['Sentimental', 'Classic Collector', 'Vintage Soul']
    },
    ECLECTIC_DABBLER: {
        id: 'eclectic_dabbler',
        label: 'Eclectic Dabbler',
        description: 'Your taste is a wild mix. You find joy in every corner of cinema without a single fixed lane.',
        icon: 'fa-blend',
        traits: ['Versatile', 'Open-Minded', 'Unpredictable']
    }
};

/**
 * Computes the cinematic archetype based on user stats.
 * @param {Object} stats User statistics from CinemaDNA
 * @returns {Object} { id, label, confidence, dominantTraits, reasons, description, icon }
 */
export function computeArchetype(stats) {
    if (!stats || !stats.totalMoviesSaved || stats.totalMoviesSaved === 0) {
        return null;
    }

    // Normalize inputs (0-1)
    const emotional = (stats.avgEmotional || 50) / 100;
    const cognitive = (stats.avgCognitive || 50) / 100;
    const comfort = (stats.avgComfort || 50) / 100;
    const rewatchRate = stats.rewatchRate || 0.2; // Default if not tracked
    const hiddenGemAffinity = (stats.hiddenGemAffinity || 0) / 10; // Assuming 0-10 scale

    const genreCounts = stats.genreCounts || {};
    const totalMovies = stats.totalMoviesSaved || 1;

    const dramaRomanceFreq = ((genreCounts['Drama'] || 0) + (genreCounts['Romance'] || 0)) / totalMovies;
    const sciFiMysteryFreq = ((genreCounts['Sci-Fi'] || 0) + (genreCounts['Mystery'] || 0)) / totalMovies;
    const actionThrillerFreq = ((genreCounts['Action'] || 0) + (genreCounts['Thriller'] || 0)) / totalMovies;
    const romanceClassicFreq = ((genreCounts['Romance'] || 0) + (genreCounts['Classic'] || 0) + (genreCounts['History'] || 0)) / totalMovies;

    const shortRuntimeBias = stats.avgRuntime < 100 ? 1 : (stats.avgRuntime < 120 ? 0.5 : 0);
    const avgRuntimeShortness = Math.max(0, 1 - (stats.avgRuntime / 180));
    const imdbRatingBias = Math.max(0, (parseFloat(stats.avgRating || 0) - 5) / 5);
    const percentOlderDecades = stats.percentOlderDecades || 0;

    // Scores (0-1)
    const scores = {};

    scores.emotional_purist = 0.6 * emotional + 0.2 * rewatchRate + 0.2 * Math.min(1, dramaRomanceFreq * 2);
    scores.comfort_watcher = 0.6 * comfort + 0.3 * rewatchRate + 0.1 * shortRuntimeBias;
    scores.intellectual_explorer = 0.5 * cognitive + 0.3 * hiddenGemAffinity + 0.2 * Math.min(1, sciFiMysteryFreq * 2);
    scores.adrenaline_seeker = 0.7 * Math.min(1, actionThrillerFreq * 2) + 0.2 * avgRuntimeShortness + 0.1 * imdbRatingBias;
    scores.nostalgia_lover = 0.6 * percentOlderDecades + 0.3 * rewatchRate + 0.1 * Math.min(1, romanceClassicFreq * 2);

    // Eclectic Dabbler: low variance across core metrics
    const coreMetrics = [emotional, cognitive, comfort, actionThrillerFreq, dramaRomanceFreq];
    const mean = coreMetrics.reduce((a, b) => a + b, 0) / coreMetrics.length;
    const variance = coreMetrics.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / coreMetrics.length;
    const stdDev = Math.sqrt(variance);
    scores.eclectic_dabbler = Math.max(0, 1 - (stdDev * 3)); // Inverse stddev, boosted

    // Find the max
    let winnerId = 'eclectic_dabbler';
    let maxScore = -1;
    for (const [id, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            winnerId = id;
        }
    }

    const archetype = ARCHETYPES[winnerId.toUpperCase()];
    const totalScoreSum = Object.values(scores).reduce((a, b) => a + b, 0);
    const confidence = Math.round((maxScore / totalScoreSum) * 100);

    const reasons = [];
    if (winnerId === 'emotional_purist') {
        reasons.push("You prioritize high emotional stakes in your movie choices.");
        reasons.push("Your genre preference leans heavily towards character dramas.");
    } else if (winnerId === 'comfort_watcher') {
        reasons.push("You tend to favor titles with high comfort scores and shorter runtimes.");
        if (rewatchRate > 0.4) reasons.push("A high rewatch rate suggests you value familiarity.");
    } else if (winnerId === 'intellectual_explorer') {
        reasons.push("You enjoy films that challenge your cognitive load.");
        if (hiddenGemAffinity > 0.5) reasons.push("You have a strong affinity for undiscovered 'Hidden Gems'.");
    } else if (winnerId === 'adrenaline_seeker') {
        reasons.push("Your history is dominated by fast-paced Action and Thriller titles.");
        reasons.push("You rarely sit through slow-burn epics, preferring tighter runtimes.");
    } else if (winnerId === 'nostalgia_lover') {
        reasons.push("A significant portion of your library comes from older decades.");
        reasons.push("You appreciate the storytelling style of classic cinema.");
    } else {
        reasons.push("Your taste doesn't fit into a single box; you enjoy variety.");
        reasons.push("Your metric distribution is balanced across all categories.");
    }

    return {
        ...archetype,
        confidence,
        dominantTraits: archetype.traits,
        reasons
    };
}
