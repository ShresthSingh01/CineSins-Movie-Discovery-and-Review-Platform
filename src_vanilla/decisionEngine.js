import { computeRegretScore } from './regrisk.js';

/**
 * Decision Engine
 * Curates movie recommendations based on mood, company, and time constraints.
 * Includes an 'epsilon' exploration factor for "experimental" picks.
 */
export async function decisionEngine(options, movies) {
    if (!movies) {
        const stored = localStorage.getItem("allMovies");
        movies = stored ? JSON.parse(stored) : [];
    }

    // Handle "auto" options
    const userProfile = JSON.parse(localStorage.getItem("userProfile"));
    const dna = JSON.parse(localStorage.getItem("cinemaDNA"));

    const mood = (options.mood === 'auto' || !options.mood) ? 'Comfort' : options.mood;
    const company = (options.company === 'auto' || !options.company) ? 'Alone' : options.company;
    const timeLimit = (options.time === 'auto' || !options.time) ? 120 : parseInt(options.time);
    const epsilon = options.epsilon || 0;
    const region = options.region;

    const moodMap = {
        'Comfort': ['Comedy', 'Romance', 'Animation', 'Family'],
        'Vibing': ['Animation', 'Adventure', 'Music', 'Sci-Fi', 'Fantasy'],
        'Good': ['Drama', 'Crime', 'Biography', 'History'],
        'Exciting': ['Action', 'Adventure', 'Sci-Fi', 'Thriller', 'Horror'],
        'Thoughtful': ['Drama', 'Mystery', 'Documentary', 'Biography', 'Sci-Fi']
    };

    // Filter by Region
    let filteredMovies = movies;
    if (region && region !== 'all') {
        filteredMovies = movies.filter(m => m.regionTags && m.regionTags.includes(region));
    }

    // Filter by Runtime
    let candidates = filteredMovies.filter(m => {
        const runtimeMatch = (m.runtime || "").match(/\d+/);
        if (!runtimeMatch) return true;
        const mins = parseInt(runtimeMatch[0], 10);

        if (timeLimit <= 90) return mins <= 95;
        if (timeLimit <= 120) return mins <= 125;
        return mins > 120;
    });

    if (candidates.length < 5) candidates = movies;

    const currentYear = new Date().getFullYear();

    let scored = candidates.map(m => {
        const imdbRating = parseFloat(m.imdbRating) || 5.0;
        const year = parseInt(m.Year || m.year) || 2000;
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
        if (company === 'Family') {
            const isFamily = (m.genres || '').includes('Family') || (m.genres || '').includes('Animation');
            if (isFamily) score += 0.2;
            else score -= 0.1;
        } else if (company === 'Couple') {
            const isRomance = (m.genres || '').includes('Romance') || (m.genres || '').includes('Drama');
            if (isRomance) score += 0.1;
        }

        // Small random factor
        score += (Math.random() * 0.05);

        // Regret Risk Penalty
        const regRisk = computeRegretScore(m, { archetype: userProfile?.archetype, dna });
        m.regRisk = regRisk; // Cache it on the movie
        if (regRisk && regRisk.label === 'High') score -= 0.3;
        else if (regRisk && regRisk.label === 'Medium') score -= 0.1;

        let dominant = "Comfort";
        let maxVal = metrics.comfortScore;
        if (metrics.emotionalIntensity > maxVal) { dominant = "Intensity"; maxVal = metrics.emotionalIntensity; }
        if (metrics.cognitiveLoad > maxVal) { dominant = "Thought-Provoking"; }

        return { movie: m, score, dominant };
    });

    scored.sort((a, b) => b.score - a.score);

    // Epsilon-Exploration: Inject experimental picks
    const results = [];
    const pool = [...scored];

    for (let i = 0; i < 3; i++) {
        if (pool.length === 0) break;

        let selectedIdx = 0; // Default to best
        if (Math.random() < epsilon && pool.length > 5) {
            // Pick a random one from the lower half of the top 20 or just any random from pool
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
