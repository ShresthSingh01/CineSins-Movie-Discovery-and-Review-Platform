import { api } from './api.js';

export const store = {
    getReviews() {
        return JSON.parse(localStorage.getItem("reviews")) || [];
    },

    saveReview(review) {
        const reviews = this.getReviews();
        const index = reviews.findIndex(r => r.id === review.id);
        if (index > -1) {
            reviews[index] = review;
        } else {
            reviews.push(review);
        }
        localStorage.setItem("reviews", JSON.stringify(reviews));
    },

    removeReview(id) {
        const reviews = this.getReviews().filter(r => r.id !== id);
        localStorage.setItem("reviews", JSON.stringify(reviews));
    },

    getWatchlist() {
        return JSON.parse(localStorage.getItem("watchlist")) || [];
    },

    toggleWatchlist(movie) {
        let wl = this.getWatchlist();
        const index = wl.findIndex(m => m.id === movie.id);
        if (index > -1) {
            wl.splice(index, 1);
            localStorage.setItem("watchlist", JSON.stringify(wl));
            return false; // Removed
        } else {
            wl.unshift(movie);
            localStorage.setItem("watchlist", JSON.stringify(wl));
            return true; // Added
        }
    },

    getRecentSearches() {
        return JSON.parse(localStorage.getItem("recent")) || [];
    },

    saveRecentSearch(query) {
        let list = this.getRecentSearches();
        list = [query, ...list.filter(x => x !== query)].slice(0, 5);
        localStorage.setItem("recent", JSON.stringify(list));
        return list;
    },

    getAllMovies() {
        const movies = JSON.parse(localStorage.getItem("allMovies")) || [];
        const validMovies = movies.filter(m => m && m.id && m.title);
        if (validMovies.length !== movies.length) {
            localStorage.setItem("allMovies", JSON.stringify(validMovies));
        }
        return validMovies;
    },

    saveMoviesBatch(movies) {
        let existing = this.getAllMovies();
        const existingIds = new Set(existing.map(m => m.id));
        const newMovies = movies.filter(m => !existingIds.has(m.id)).map(normalizeMovieData);
        if (newMovies.length > 0) {
            existing = existing.concat(newMovies);
            localStorage.setItem("allMovies", JSON.stringify(existing));
        }
    },

    async seedMoviesIfNeeded() {
        let movies = this.getAllMovies();
        if (movies.length < 50) {
            const popularMovies = await api.fetchPopularMoviesBatch();
            this.saveMoviesBatch(popularMovies);
        }
    },

    computeHiddenScores() {
        let movies = this.getAllMovies();
        let updated = false;

        // LRU cap: if over 1000 movies, prune down to 500 sorted by recency or keep the highest rated.
        // Given we just have an array without explicit timestamps, we'll keep the newest 500 (end of array).
        if (movies.length > 1000) {
            movies = movies.slice(-500);
            updated = true;
        }

        movies = movies.map(m => {
            if (m.hiddenScore === undefined) {
                const rating = parseFloat(m.imdbRating) || 0;
                const votes = parseInt((m.imdbVotes || "0").replace(/,/g, '')) || 0;
                if (rating > 0 && votes > 0) {
                    m.hiddenScore = rating / Math.log(1 + votes);
                } else {
                    m.hiddenScore = 0;
                }
                updated = true;
            }
            return m;
        });

        if (updated) {
            localStorage.setItem("allMovies", JSON.stringify(movies));
        }
    },

    async getHiddenGems() {
        await this.seedMoviesIfNeeded();
        this.computeHiddenScores();
        const movies = this.getAllMovies();

        // Sort descending by hiddenScore
        const valid = movies.filter(m => m.hiddenScore && m.hiddenScore > 0);
        valid.sort((a, b) => b.hiddenScore - a.hiddenScore);

        return valid.slice(0, 20);
    },

    // Scene Tags
    getAllTags() {
        return JSON.parse(localStorage.getItem("sceneTags")) || {};
    },

    getTags(movieId) {
        const allTags = this.getAllTags();
        return allTags[movieId] || [];
    },

    addTag(movieId, tag) {
        const rawTag = tag.trim().toLowerCase();
        if (!rawTag) return;

        const allTags = this.getAllTags();
        const movieTags = allTags[movieId] || [];

        // Add if it doesn't exist
        if (!movieTags.includes(rawTag)) {
            movieTags.push(rawTag);
            allTags[movieId] = movieTags;
            localStorage.setItem("sceneTags", JSON.stringify(allTags));
        }
    },

    exportTags() {
        return JSON.stringify(this.getAllTags(), null, 2);
    },

    importTags(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (typeof parsed === 'object' && parsed !== null) {
                // Merge with existing
                const existing = this.getAllTags();
                for (const [id, tags] of Object.entries(parsed)) {
                    if (Array.isArray(tags)) {
                        existing[id] = [...new Set([...(existing[id] || []), ...tags])];
                    }
                }
                localStorage.setItem("sceneTags", JSON.stringify(existing));
                return true;
            }
        } catch {
            return false;
        }
        return false;
    }
};

/**
 * Computes emotional metrics for a movie based on normalized data.
 * @param {Object} movie The normalized movie object
 * @returns {Object} { emotionalIntensity, cognitiveLoad, comfortScore } from 0-100
 * 
 * Formula:
 * - emotionalIntensity: Base 50. +20 for Drama/Thriller/Action, -10 for Comedy/Family. + (imdbRating * 2). Max 100.
 * - cognitiveLoad: Base 40. +20 for Sci-Fi/Mystery/Documentary, + (runtimeMin - 90)/2 if runtime > 90. Max 100.
 * - comfortScore: Base 50. +30 for Comedy/Romance/Animation/Family, -20 for Horror/Thriller. + (imdbRating * 3). Max 100.
 */
export function computeMetrics(movie) {
    const genres = movie.normalizedGenres || [];
    const rating = Math.min(10, Math.max(0, movie.imdbRatingFloat || 5.0)); // Default 5.0 if missing
    const runtime = Math.max(0, movie.runtimeMin || 90); // Default 90 if missing

    // Emotional Intensity
    let intensity = 50;
    if (genres.some(g => ['Drama', 'Thriller', 'Action', 'Horror'].includes(g))) intensity += 20;
    if (genres.some(g => ['Comedy', 'Family', 'Animation'].includes(g))) intensity -= 10;
    intensity += (rating * 2);
    intensity = Math.min(100, Math.max(0, Math.round(intensity)));

    // Cognitive Load
    let load = 40;
    if (genres.some(g => ['Sci-Fi', 'Mystery', 'Documentary', 'Biography'].includes(g))) load += 20;
    if (runtime > 90) {
        load += (runtime - 90) / 2;
    }
    load = Math.min(100, Math.max(0, Math.round(load)));

    // Comfort Score
    let comfort = 50;
    if (genres.some(g => ['Comedy', 'Romance', 'Animation', 'Family'].includes(g))) comfort += 30;
    if (genres.some(g => ['Horror', 'Thriller', 'Crime'].includes(g))) comfort -= 20;
    comfort += (rating * 3);
    comfort = Math.min(100, Math.max(0, Math.round(comfort)));

    return {
        emotionalIntensity: intensity,
        cognitiveLoad: load,
        comfortScore: comfort
    };
}

// Add a normalization helper for metrics persistence
export function normalizeMovieData(movie) {
    if (!movie) return movie;

    // Create new normalized properties
    movie.normalizedGenres = (movie.genres || movie.Genre || "").split(',').map(g => g.trim()).filter(Boolean);

    const runtimeStr = String(movie.runtime || movie.Runtime || "0");
    const runtimeMatch = runtimeStr.match(/\d+/);
    movie.runtimeMin = runtimeMatch ? parseInt(runtimeMatch[0], 10) : 0;

    movie.imdbRatingFloat = parseFloat(movie.imdbRating || 0) || 0;
    movie.imdbVotesInt = parseInt(String(movie.imdbVotes || "0").replace(/,/g, '')) || 0;

    // Attach core metrics
    movie.metrics = computeMetrics(movie);
    return movie;
}

export async function decisionEngine(options) {
    let movies = store.getAllMovies();
    if (movies.length < 50) {
        await store.seedMoviesIfNeeded();
        movies = store.getAllMovies();
    }

    const moodMap = {
        'Comfort': ['Comedy', 'Romance', 'Animation', 'Family'],
        'Exciting': ['Action', 'Adventure', 'Sci-Fi', 'Thriller'],
        'Thoughtful': ['Drama', 'Mystery', 'Documentary', 'Biography'],
        'Laugh': ['Comedy']
    };
    const preferredGenres = moodMap[options.mood] || [];

    // Filter by Runtime
    let candidates = movies.filter(m => {
        const runtimeMatch = (m.runtime || "").match(/\d+/);
        if (!runtimeMatch) return false;
        const mins = parseInt(runtimeMatch[0], 10);

        let timeFits = false;
        if (options.time <= 90) timeFits = (mins <= 90);
        else if (options.time <= 120) timeFits = (mins <= 120);
        else timeFits = (mins > 120);
        return timeFits;
    });

    // We shouldn't drop all movies if none fit the exact time to prevent empty states
    if (candidates.length < 3) {
        candidates = movies;
    }

    const currentYear = new Date().getFullYear();

    candidates = candidates.map(m => {
        const imdbRating = parseFloat(m.imdbRating) || 5.0;
        const year = parseInt(m.Year) || 2000;

        const metrics = m.metrics || { comfortScore: 50, emotionalIntensity: 50, cognitiveLoad: 50 };

        let moodScore = 50;
        if (options.mood === 'Comfort' || options.mood === 'Laugh') moodScore = metrics.comfortScore;
        else if (options.mood === 'Exciting') moodScore = metrics.emotionalIntensity;
        else if (options.mood === 'Thoughtful') moodScore = metrics.cognitiveLoad;

        const normalizedMood = moodScore / 100;
        const normalizedRating = imdbRating / 10;

        // Recency Bias (0 to 1, where current year is 1, and 50 years ago is 0)
        let recency = 1 - Math.min(1, (currentYear - year) / 50);
        if (recency < 0) recency = 0;

        // Weights: 0.6 Mood Constraint, 0.3 IMDB Rating, 0.1 Recency Bias
        const score = (0.6 * normalizedMood) + (0.3 * normalizedRating) + (0.1 * recency);

        // Compute Dominant Metric
        let dominant = "Comfort";
        let maxVal = metrics.comfortScore;
        if (metrics.emotionalIntensity > maxVal) { dominant = "Intensity"; maxVal = metrics.emotionalIntensity; }
        if (metrics.cognitiveLoad > maxVal) { dominant = "Thought-Provoking"; }

        // Determine if genre actually matched
        const movieGenres = (m.genres || '').split(',').map(g => g.trim());
        const matched = movieGenres.filter(g => preferredGenres.includes(g));

        return {
            movie: m,
            score,
            moodScore,
            dominant,
            matchedGenres: matched
        };
    });

    // Give slight edge to actual genre matches
    candidates.forEach(c => {
        if (c.matchedGenres.length > 0) c.score += 0.05;
    });

    candidates.sort((a, b) => b.score - a.score);

    const top3 = candidates.slice(0, 3);
    return top3.map(c => {
        const m = c.movie;
        const explain = `High ${c.dominant.toLowerCase()} score (${c.moodScore}) and runtime fits ${m.runtime}.`;
        return {
            ...m,
            explain,
            dominantMetric: c.dominant
        };
    });
}

export function computeCompatibility(personAMovies, personBMovies) {
    const getGenres = (movies) => [...new Set(movies.flatMap(m => (m.genres || '').split(',').map(g => g.trim())))];
    const getDirectors = (movies) => [...new Set(movies.flatMap(m => (m.director || '').split(',').map(d => d.trim())))];

    const aGenres = getGenres(personAMovies);
    const bGenres = getGenres(personBMovies);
    const commonGenres = aGenres.filter(g => bGenres.includes(g) && g);

    const aDirs = getDirectors(personAMovies);
    const bDirs = getDirectors(personBMovies);
    const commonDirs = aDirs.filter(d => bDirs.includes(d) && d && d !== "N/A");

    const getAvgMetrics = (movies) => {
        let e = 0, c = 0, f = 0;
        movies.forEach(m => {
            if (m.metrics) {
                e += m.metrics.emotionalIntensity || 0;
                c += m.metrics.cognitiveLoad || 0;
                f += m.metrics.comfortScore || 0;
            }
        });
        const len = Math.max(1, movies.length);
        return { e: e / len, c: c / len, f: f / len };
    };

    const aMetrics = getAvgMetrics(personAMovies);
    const bMetrics = getAvgMetrics(personBMovies);

    const distance = Math.abs(aMetrics.e - bMetrics.e) + Math.abs(aMetrics.c - bMetrics.c) + Math.abs(aMetrics.f - bMetrics.f);

    // Scoring weights:
    // Base 10
    // Genre Overlap up to 50
    // Director Overlap up to 10
    // Metrics distance (max 300 diff) -> up to 30

    let score = 10;
    if (commonGenres.length > 0) score += Math.min(50, commonGenres.length * 15);
    if (commonDirs.length > 0) score += Math.min(10, commonDirs.length * 5);
    score += Math.max(0, 30 - (distance / 300) * 30);

    const percentage = Math.min(100, Math.round(score));

    // Suggest 3 movies
    const allMovies = store.getAllMovies();
    const excludeIds = new Set([...personAMovies, ...personBMovies].map(m => m.id || m.imdbID));
    const combinedGenres = new Set([...aGenres, ...bGenres]);

    let candidates = allMovies.filter(m => !excludeIds.has(m.id || m.imdbID));
    candidates = candidates.map(m => {
        const movieGenres = (m.genres || '').split(',').map(g => g.trim());
        let matchCount = 0;
        for (const g of movieGenres) {
            if (combinedGenres.has(g)) matchCount++;
        }
        const rating = parseFloat(m.imdbRating) || 0;
        const finalScore = rating + (matchCount * 2);
        return { movie: m, score: finalScore, matchCount };
    });

    candidates.sort((a, b) => b.score - a.score);
    const suggested = candidates.slice(0, 3).map(c => c.movie);

    const resultObj = {
        compatibilityScore: percentage,
        commonGenres,
        distanceMetrics: Math.round(distance),
        suggestedMovies: suggested.map(m => ({
            title: m.title || m.Title,
            id: m.id || m.imdbID,
            reason: `High rating & matches favorite genres.`
        }))
    };

    return {
        percentage,
        commonGenres,
        suggestedMovies: suggested,
        jsonString: JSON.stringify(resultObj, null, 2)
    };
}

export function computeUserAnalytics() {
    const reviews = store.getReviews();
    const allMovies = store.getAllMovies();
    const reviewedIds = new Set(reviews.map(r => r.id));

    const userMovies = allMovies.filter(m => reviewedIds.has(m.id || m.imdbID));

    const genreCounts = {};
    const directorCounts = {};
    let totalRating = 0;
    let validRatingCount = 0;
    let totalEmotional = 0;
    let validEmotionalCount = 0;

    userMovies.forEach(m => {
        const genres = (m.genres || '').split(',').map(g => g.trim()).filter(Boolean);
        genres.forEach(g => {
            genreCounts[g] = (genreCounts[g] || 0) + 1;
        });

        const directors = (m.director || '').split(',').map(d => d.trim()).filter(Boolean);
        directors.forEach(d => {
            if (d !== "N/A") {
                directorCounts[d] = (directorCounts[d] || 0) + 1;
            }
        });

        if (m.metrics && m.metrics.emotionalIntensity !== undefined) {
            totalEmotional += m.metrics.emotionalIntensity;
            validEmotionalCount++;
        }
    });

    reviews.forEach(r => {
        if (r.rating !== undefined && !isNaN(r.rating)) {
            totalRating += Number(r.rating);
            validRatingCount++;
        }
    });

    const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
    const favoriteGenre = sortedGenres.length > 0 ? sortedGenres[0][0] : "N/A";

    const sortedDirectors = Object.entries(directorCounts).sort((a, b) => b[1] - a[1]);
    const top5Directors = sortedDirectors.slice(0, 5).map(d => d[0]);

    const avgRating = validRatingCount > 0 ? (totalRating / validRatingCount).toFixed(1) : 0;

    const avgEmotional = validEmotionalCount > 0 ? Math.round(totalEmotional / validEmotionalCount) : 0;
    let moodTrend = "Neutral";
    if (avgEmotional > 70) moodTrend = "Intense/Exciting";
    else if (avgEmotional > 40) moodTrend = "Balanced";
    else if (avgEmotional > 0) moodTrend = "Calm/Relaxed";
    else moodTrend = "N/A";

    let totalRuntime = 0;
    userMovies.forEach(m => {
        totalRuntime += (m.runtimeMin || 0);
    });
    const avgRuntime = userMovies.length > 0 ? Math.round(totalRuntime / userMovies.length) : 0;

    // Format total watch time nicely
    const hours = Math.floor(totalRuntime / 60);
    const mins = totalRuntime % 60;
    const totalWatchTimeString = `${hours}h ${mins}m`;

    const analytics = {
        totalMoviesSaved: userMovies.length,
        favoriteGenre,
        genreCounts,
        avgRating,
        totalReviews: reviews.length,
        top5Directors,
        moodTrend,
        avgEmotional,
        avgRuntime,
        totalWatchTimeString
    };

    localStorage.setItem("cinemaDNA", JSON.stringify(analytics));
    return analytics;
}
