// Updated api.js: Now connects to our Node.js Backend instead of TMDB/OMDB directly
const BASE_URL = 'http://localhost:5000/api';

const cache = new Map();

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    // Auto-inject auth token if available (using localStorage for tokens now)
    const token = localStorage.getItem('cinesins_token');
    const headers = options.headers || {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(resource, {
        ...options,
        headers,
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}

export const api = {
    async searchMovies(query) {
        if (cache.has(`search_${query}`)) return cache.get(`search_${query}`);
        try {
            const res = await fetchWithTimeout(`${BASE_URL}/movies/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error("Backend search failed");
            const data = await res.json();

            // The backend returns normalized data already
            cache.set(`search_${query}`, data);
            return data;
        } catch (e) {
            console.error("Search failed:", e);
            return [];
        }
    },

    async fetchMovieById(id) {
        if (cache.has(`movie_${id}`)) return cache.get(`movie_${id}`);
        try {
            const res = await fetchWithTimeout(`${BASE_URL}/movies/${id}`);
            if (!res.ok) throw new Error(`Backend fetch failed for ${id}`);
            const data = await res.json();
            if (data) cache.set(`movie_${id}`, data);
            return data;
        } catch (e) {
            console.error(`FetchMovieById failed for ${id}:`, e);
            return null;
        }
    },

    // A helper method for searching by title directly 
    async fetchMovieByTitle(title) {
        const searchRes = await this.searchMovies(title);
        if (searchRes && searchRes.length > 0) {
            return await this.fetchMovieById(searchRes[0]._id);
        }
        return null;
    },

    async fetchPopularMoviesBatch() {
        try {
            const res = await fetchWithTimeout(`${BASE_URL}/movies/trending/week`);
            if (!res.ok) throw new Error("Trending fetch failed");
            return await res.json();
        } catch (e) {
            console.error("fetchPopularMoviesBatch failed", e);
            return [];
        }
    },

    async fetchHiddenGemsBatch() {
        // Mocking for now, could be a real route later
        return this.fetchPopularMoviesBatch();
    }
};
