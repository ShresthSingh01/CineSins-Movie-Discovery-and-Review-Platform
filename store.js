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
        return JSON.parse(localStorage.getItem("allMovies")) || [];
    },

    saveMoviesBatch(movies) {
        let existing = this.getAllMovies();
        const existingIds = new Set(existing.map(m => m.id));
        const newMovies = movies.filter(m => !existingIds.has(m.id));
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

    getHiddenGems() {
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

    candidates = candidates.map(m => {
        const imdbRating = parseFloat(m.imdbRating) || 0;
        const imdbVotes = parseInt((m.imdbVotes || "0").replace(/,/g, '')) || 0;

        const movieGenres = (m.genres || '').split(',').map(g => g.trim());
        let genreMatchCount = 0;
        const matched = [];
        for (const g of movieGenres) {
            if (preferredGenres.includes(g)) {
                genreMatchCount++;
                matched.push(g);
            }
        }

        const score = (imdbRating * Math.log(1 + imdbVotes)) + 0.5 * genreMatchCount;
        return { movie: m, score, genreMatchCount, matchedGenres: matched };
    });

    candidates = candidates.filter(c => c.genreMatchCount > 0);
    candidates.sort((a, b) => b.score - a.score);

    const top3 = candidates.slice(0, 3);
    return top3.map(c => {
        const m = c.movie;
        const explain = `Matches your mood (${c.matchedGenres.join(', ')}) and fits ${m.runtime}.`;
        return { ...m, explain };
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
    let totalRuntimeMins = 0;
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

        const rt = parseInt((m.runtime || '0').replace(/\D/g, ''), 10);
        if (!isNaN(rt) && rt > 0) {
            totalRuntimeMins += rt;
        }

        if (m.metrics && m.metrics.emotionalIntensity !== undefined) {
            totalEmotional += m.metrics.emotionalIntensity;
            validEmotionalCount++;
        }
    });

    const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
    const favoriteGenre = sortedGenres.length > 0 ? sortedGenres[0][0] : "N/A";

    const sortedDirectors = Object.entries(directorCounts).sort((a, b) => b[1] - a[1]);
    const top5Directors = sortedDirectors.slice(0, 5).map(d => d[0]);

    const avgRuntime = userMovies.length > 0 ? Math.round(totalRuntimeMins / userMovies.length) : 0;

    const avgEmotional = validEmotionalCount > 0 ? Math.round(totalEmotional / validEmotionalCount) : 0;
    let moodTrend = "Neutral";
    if (avgEmotional > 70) moodTrend = "Intense/Exciting";
    else if (avgEmotional > 40) moodTrend = "Balanced";
    else if (avgEmotional > 0) moodTrend = "Calm/Relaxed";
    else moodTrend = "N/A";

    const analytics = {
        totalMoviesSaved: userMovies.length,
        favoriteGenre,
        genreCounts,
        avgRuntime,
        totalRuntimeMins,
        top5Directors,
        moodTrend,
        avgEmotional
    };

    localStorage.setItem("cinemaDNA", JSON.stringify(analytics));
    return analytics;
}
