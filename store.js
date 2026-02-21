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
