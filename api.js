const API_KEY = "5dddf095";
const cache = new Map();

export const api = {
    async searchMovies(query) {
        if (cache.has(`search_${query}`)) return cache.get(`search_${query}`);
        try {
            const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`);
            const data = await res.json();
            if (data.Response === "True") {
                cache.set(`search_${query}`, data.Search);
                return data.Search;
            }
            return [];
        } catch {
            return [];
        }
    },

    async fetchMovieById(id) {
        if (cache.has(`movie_${id}`)) return cache.get(`movie_${id}`);
        try {
            const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`);
            const data = await res.json();
            if (data.Response === "True") {
                cache.set(`movie_${id}`, data);
                return data;
            }
            return null;
        } catch {
            return null;
        }
    },

    async fetchRawMovieByTitle(title) {
        if (cache.has(`rawtitle_${title}`)) return cache.get(`rawtitle_${title}`);
        try {
            const res = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}`);
            const data = await res.json();
            if (data.Response === "True") {
                cache.set(`rawtitle_${title}`, data);
                return data;
            }
            return null;
        } catch {
            return null;
        }
    },

    async fetchMovieByTitle(title) {
        const raw = await this.fetchRawMovieByTitle(title);
        if (raw) {
            return {
                id: raw.imdbID,
                title: raw.Title,
                year: raw.Year,
                genres: raw.Genre,
                runtime: raw.Runtime,
                director: raw.Director,
                actors: raw.Actors,
                poster: raw.Poster,
                imdbRating: raw.imdbRating,
                imdbVotes: raw.imdbVotes
            };
        }
        return null;
    }
};
