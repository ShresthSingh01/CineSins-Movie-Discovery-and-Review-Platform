// src/lib/decisionEngine.ts
import { Movie, UserProfile, UserStats, DecisionOptions } from './types';
import { computeRegretScore } from './regrisk';

export async function decisionEngine(
    options: DecisionOptions,
    movies: Movie[],
    userProfile?: UserProfile,
    dna?: UserStats
) {
    if (!movies || movies.length === 0) return [];

    const mood = (options.mood === 'auto' || !options.mood) ? 'Comfort' : options.mood;
    const company = (options.company === 'auto' || !options.company) ? 'Alone' : options.company;

    let timeLimit = 120;
    if (options.time === 'auto' || !options.time) {
        timeLimit = 120;
    } else {
        timeLimit = typeof options.time === 'string' ? parseInt(options.time) : options.time;
    }

    const epsilon = options.epsilon || 0;
    const region = options.region;

    // Filter by Region
    let filteredMovies = movies;
    if (region && region !== 'all') {
        filteredMovies = movies.filter(m => m.regionTags && m.regionTags.includes(region));
    }

    // Filter by Runtime
    let candidates = filteredMovies.filter(m => {
        const runtimeStr = String(m.runtime || m.Runtime || "");
        const runtimeMatch = runtimeStr.match(/\d+/);
        if (!runtimeMatch) return true;
        const mins = parseInt(runtimeMatch[0], 10);

        if (timeLimit <= 90) return mins <= 95;
        if (timeLimit <= 120) return mins <= 125;
        return mins > 120;
    });

    if (candidates.length < 5) candidates = filteredMovies.length > 0 ? filteredMovies : movies;

    const currentYear = new Date().getFullYear();

    let scored = candidates.map(m => {
        const imdbRating = parseFloat(m.imdbRating || "0") || 5.0;
        const year = parseInt(String(m.Year || m.year || "2000")) || 2000;
        const metrics = m.metrics || { comfortScore: 50, emotionalIntensity: 50, cognitiveLoad: 50 };

        let moodScore = 50;
        if (mood === 'Comfort') moodScore = metrics.comfortScore;
        else if (mood === 'Exciting') moodScore = metrics.emotionalIntensity;
        else if (mood === 'Thoughtful') moodScore = metrics.cognitiveLoad;
        else if (mood === 'Vibing') moodScore = (metrics.comfortScore + metrics.cognitiveLoad) / 2;
        else if (mood === 'Good') moodScore = (metrics.emotionalIntensity + metrics.cognitiveLoad) / 2;

        let score = (0.5 * (moodScore / 100)) + (0.3 * (imdbRating / 10));

        // Recency Bias
        const age = Math.max(0, currentYear - year);
        score += (0.1 * (1 - Math.min(1, age / 50)));

        // Company filter logic
        const genres = (m.genres || '').toLowerCase();
        if (company === 'Family') {
            const isFamily = genres.includes('family') || genres.includes('animation');
            if (isFamily) score += 0.2;
            else score -= 0.1;
        } else if (company === 'Couple') {
            const isRomance = genres.includes('romance') || genres.includes('drama');
            if (isRomance) score += 0.1;
        }

        // Small random factor
        score += (Math.random() * 0.05);

        // Regret Risk Penalty
        const regRisk = computeRegretScore(m, { archetype: userProfile?.archetype, dna });
        m.regRisk = regRisk;
        if (regRisk && regRisk.label === 'High') score -= 0.3;
        else if (regRisk && regRisk.label === 'Medium') score -= 0.1;

        let dominant = "Comfort";
        let maxVal = metrics.comfortScore;
        if (metrics.emotionalIntensity > maxVal) { dominant = "Intensity"; maxVal = metrics.emotionalIntensity; }
        if (metrics.cognitiveLoad > maxVal) { dominant = "Thought-Provoking"; }

        return { movie: m, score, dominant };
    });

    scored.sort((a, b) => b.score - a.score);

    const results = [];
    const pool = [...scored];

    for (let i = 0; i < 3; i++) {
        if (pool.length === 0) break;

        let selectedIdx = 0;
        if (Math.random() < epsilon && pool.length > 5) {
            selectedIdx = 1 + Math.floor(Math.random() * Math.min(pool.length - 1, 10));
        }

        const selected = pool.splice(selectedIdx, 1)[0];
        results.push({
            ...selected.movie,
            explain: selectedIdx === 0 ?
                `Matches your ${mood.toLowerCase()} mood perfectly.` :
                `Experimental pick based on your emerging trends.`,
            dominantMetric: selected.dominant
        });
    }

    return results;
}
