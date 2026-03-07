// src/lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const cache = new Map();

async function fetchWithTimeout(resource: string, options: RequestInit & { timeout?: number } = {}) {
    const { timeout = 30000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('cinesins_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    try {
        const response = await fetch(resource, {
            ...options,
            headers,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

export const api = {
    async searchMovies(query: string) {
        if (cache.has(`search_${query}`)) return cache.get(`search_${query}`);
        try {
            const res = await fetchWithTimeout(`${BASE_URL}/movies/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error("Backend search failed");
            const data = await res.json();
            cache.set(`search_${query}`, data);
            return data;
        } catch (e) {
            console.error("Search failed:", e);
            return [];
        }
    },

    async fetchMovieById(id: string) {
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

    async fetchMovieByTitle(title: string) {
        const searchRes = await this.searchMovies(title);
        if (searchRes && searchRes.length > 0) {
            return await this.fetchMovieById(searchRes[0]._id || searchRes[0].id);
        }
        return null;
    },

    async fetchPopularMoviesBatch() {
        try {
            console.log(`📡 Fetching trending movies from: ${BASE_URL}/movies/trending/week`);
            const res = await fetchWithTimeout(`${BASE_URL}/movies/trending/week`);
            if (!res.ok) throw new Error(`Trending fetch failed with status: ${res.status}`);
            const data = await res.json();

            if (data && data.length > 0) {
                console.log(`✅ Loaded ${data.length} trending movies from backend`);
                return data;
            }

            console.warn("⚠️ Backend returned 0 movies, using high-quality internal fallbacks");
            return this.getInternalFallbacks();
        } catch (e) {
            console.error("❌ fetchPopularMoviesBatch failed, using internal fallbacks", e);
            return this.getInternalFallbacks();
        }
    },

    getInternalFallbacks() {
        return [
            { id: "tt15239678", title: "Dune: Part Two", year: "2024", poster: "https://m.media-amazon.com/images/M/MV5BN2QyZGU4ZDctOWJmMz00ZGZlLThjOWQtN2VlM2RjMjQ5YzgzXkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_SX300.jpg", genres: "Action, Adventure, Sci-Fi", imdbRating: "8.6", plot: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family." },
            { id: "tt1160419", title: "Dune", year: "2021", poster: "https://m.media-amazon.com/images/M/MV5BN2FjNmExNWQtOTkyZC00NjhkLTMzZGUtOTExN2ZhOWVjYTRiXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg", genres: "Action, Adventure, Sci-Fi", imdbRating: "8.0", plot: "A noble family becomes embroiled in a war for control over the galaxy's most valuable asset." },
            { id: "tt6710474", title: "Everything Everywhere All at Once", year: "2022", poster: "https://m.media-amazon.com/images/M/MV5BYTdiOTIyZTQtNmQ1OS00NjZlLWIyMTgtYjUzZmE3ZWM1OTdkXkEyXkFqcGdeQXVyMTAzNw42NzU@._V1_SX300.jpg", genres: "Action, Adventure, Comedy", imdbRating: "7.8", plot: "A middle-aged Chinese immigrant is swept up into an insane adventure." },
            { id: "tt1877830", title: "The Batman", year: "2022", poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNjcwMzEzMTU@._V1_SX300.jpg", genres: "Action, Crime, Drama", imdbRating: "7.8", plot: "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues." },
            { id: "tt7069210", title: "Talk to Me", year: "2022", poster: "https://m.media-amazon.com/images/M/MV5BMmZlZDQ0OTMtMDVlNS00Y2E3LWFkMDAtZGU2ZWRiM2FhN2YyXkEyXkFqcGdeQXVyMTAxNzY1MzE@._V1_SX300.jpg", genres: "Horror, Thriller", imdbRating: "7.1", plot: "When a group of friends discover how to conjure spirits using an embalmed hand, they become hooked on the new thrill." },
            { id: "tt15327088", title: "The Last Dance", year: "2020", poster: "https://m.media-amazon.com/images/M/MV5BY2U1ZTU5YjctN2ZiOS00MzUzLWFhYjItNmRjMDdkOTVlYzFkXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_SX300.jpg", genres: "Documentary, Biography, History", imdbRating: "9.1", plot: "Charting the rise of the 1990s Chicago Bulls, led by Michael Jordan." },
            { id: "tt2906272", title: "Parasite", year: "2019", poster: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg", genres: "Drama, Thriller", imdbRating: "8.5", plot: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan." },
            { id: "tt5052448", title: "Get Out", year: "2017", poster: "https://m.media-amazon.com/images/M/MV5BMjUxMDQwNjcyNl5BMl5BanBnXkFtZTgwNzcwMzc0MTI@._V1_SX300.jpg", genres: "Horror, Mystery, Thriller", imdbRating: "7.8", plot: "A young African-American visits his white girlfriend's parents for the weekend." }
        ];
    },

    async fetchHiddenGemsBatch() {
        return this.fetchPopularMoviesBatch();
    }
};
