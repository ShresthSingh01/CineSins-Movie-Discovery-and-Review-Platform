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
            const raw = await res.json();
            if (raw.Response === "True") {
                const movie = {
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
                const finalMovie = { ...movie, metrics: this.computeMetrics(movie) };
                cache.set(`movie_${id}`, finalMovie);
                return finalMovie;
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

    computeMetrics(movie) {
        let emotionalIntensity = 0;
        let cognitiveLoad = 0;
        let comfortScore = 0;

        const genres = (movie.genres || '').split(',').map(g => g.trim());
        const runtimeMatch = (movie.runtime || "").match(/\d+/);
        const runtime = runtimeMatch ? parseInt(runtimeMatch[0], 10) : 90;
        const imdbRating = parseFloat(movie.imdbRating) || 5.0;

        // Base maps
        const emotionalMap = { 'Drama': 80, 'Romance': 70, 'War': 90, 'Comedy': 20, 'Action': 40, 'Thriller': 75, 'Horror': 85 };
        const cognitiveMap = { 'Mystery': 80, 'Sci-Fi': 75, 'Thriller': 70, 'Documentary': 65, 'Action': 30, 'Comedy': 20 };
        const comfortMap = { 'Comedy': 90, 'Family': 85, 'Animation': 80, 'Romance': 70, 'Horror': 10, 'War': 10, 'Thriller': 20 };

        genres.forEach(g => {
            if (emotionalMap[g]) emotionalIntensity += emotionalMap[g];
            if (cognitiveMap[g]) cognitiveLoad += cognitiveMap[g];
            if (comfortMap[g]) comfortScore += comfortMap[g];
        });

        if (genres.length > 0) {
            emotionalIntensity = emotionalIntensity / genres.length;
            cognitiveLoad = cognitiveLoad / genres.length;
            comfortScore = comfortScore / genres.length;
        } else {
            emotionalIntensity = 50; cognitiveLoad = 50; comfortScore = 50;
        }

        // Runtime modifiers
        if (runtime > 120) {
            emotionalIntensity += 10;
            cognitiveLoad += 15;
            comfortScore -= 10;
        } else if (runtime < 90) {
            comfortScore += 15;
        }

        // Rating modifiers
        if (imdbRating > 8.0) comfortScore += 10;
        if (imdbRating < 5.0) comfortScore -= 15;

        return {
            emotionalIntensity: Math.min(100, Math.max(0, Math.round(emotionalIntensity))),
            cognitiveLoad: Math.min(100, Math.max(0, Math.round(cognitiveLoad))),
            comfortScore: Math.min(100, Math.max(0, Math.round(comfortScore)))
        };
    },

    async fetchMovieByTitle(title) {
        const raw = await this.fetchRawMovieByTitle(title);
        if (raw) {
            const movie = {
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
            return { ...movie, metrics: this.computeMetrics(movie) };
        }
        return null;
    },

    async fetchPopularMoviesBatch() {
        const queries = ['Star Wars', 'Batman', 'Avengers', 'Matrix'];
        let allResults = [];
        for (const q of queries) {
            const searchRes = await this.searchMovies(q);
            if (searchRes && searchRes.length) allResults.push(...searchRes);
        }

        allResults = [...new Map(allResults.map(m => [m.imdbID, m])).values()].slice(0, 25);
        const detailed = [];
        for (let i = 0; i < allResults.length; i += 5) {
            const batch = allResults.slice(i, i + 5);
            const batchDetails = await Promise.all(batch.map(m => this.fetchMovieById(m.imdbID)));
            for (const movie of batchDetails) {
                if (movie && movie.id && movie.title) {
                    detailed.push(movie);
                }
            }
        }
        return detailed;
    }
};
