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
