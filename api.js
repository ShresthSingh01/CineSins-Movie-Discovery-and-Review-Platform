import { config } from './config.js';

const TMDB_API_KEY = config.TMDB_API_KEY || "INSERT_TMDB_API_KEY_HERE";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w1280";
const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/original";

const OMDB_API_KEY = config.OMDB_API_KEY || "5dddf095";
const OMDB_BASE_URL = "https://www.omdbapi.com";

const cache = new Map();

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 8000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}

// Helper to enhance poster quality for OMDB (replaces SX300 with SX1000)
function getHighResPoster(url) {
    if (!url || url === "N/A" || !url.includes("omdbapi.com")) return url;
    return url.replace(/SX\d+/, 'SX1000');
}

// Helper to convert OMDB movie object to our app's normalized format (Fallback)
async function normalizeOMDBMovie(raw) {
    const movie = {
        id: raw.imdbID,
        imdbID: raw.imdbID,
        title: raw.Title,
        Title: raw.Title,
        year: raw.Year,
        Year: raw.Year,
        genres: raw.Genre,
        runtime: raw.Runtime,
        director: raw.Director,
        actors: raw.Actors,
        poster: getHighResPoster(raw.Poster),
        Poster: getHighResPoster(raw.Poster),
        imdbRating: raw.imdbRating,
        imdbVotes: raw.imdbVotes,
        plot: raw.Plot,
        Plot: raw.Plot,
        watchLink: null,
        scenes: [],
        primaryLanguage: raw.Language ? raw.Language.split(',')[0].trim().toLowerCase() : "en",
        productionCountries: raw.Country ? raw.Country.split(',').map(c => c.trim()) : []
    };

    // Add region tags
    try {
        const lang = movie.primaryLanguage;
        const { getRegionForLanguage } = await import('./src/regionData.js');
        const region = getRegionForLanguage(lang);
        if (region) movie.regionTags = [region];
    } catch (e) { }
    // computeMetrics needs to be attached later
    return movie;
}

// Helper to convert TMDB movie object to our app's normalized format
async function normalizeTMDBMovie(tmdbMovie, credits = null, watchProviders = null, images = null) {
    const year = tmdbMovie.release_date ? tmdbMovie.release_date.split('-')[0] : "N/A";

    let genres = "N/A";
    if (tmdbMovie.genres) {
        genres = tmdbMovie.genres.map(g => g.name).join(', ');
    } else if (tmdbMovie.genre_ids) {
        // Fallback for search results which only have genre_ids
        genres = "Various";
    }

    let director = "N/A";
    let actors = "N/A";
    if (credits && credits.crew) {
        const dirObj = credits.crew.find(c => c.job === 'Director');
        if (dirObj) director = dirObj.name;
    }
    if (credits && credits.cast) {
        actors = credits.cast.slice(0, 4).map(c => c.name).join(', ');
    }

    const imdbRating = tmdbMovie.vote_average ? tmdbMovie.vote_average.toFixed(1) : "N/A";
    const imdbVotes = tmdbMovie.vote_count || "N/A";

    const poster = tmdbMovie.poster_path ? `${TMDB_IMAGE_BASE}${tmdbMovie.poster_path}` : "N/A";

    let watchLink = null;
    if (watchProviders && watchProviders.results) {
        const IN_providers = watchProviders.results.IN;
        if (IN_providers && IN_providers.link) {
            watchLink = IN_providers.link;
        } else if (watchProviders.results.US && watchProviders.results.US.link) {
            watchLink = watchProviders.results.US.link;
        }
    }

    let scenes = [];
    if (images && images.backdrops && images.backdrops.length > 0) {
        // Filter out those that have text or are vertical, prefer wide clean backdrops
        // But for simplicity, just take the top 5
        scenes = images.backdrops.slice(0, 5).map(b => `${TMDB_BACKDROP_BASE}${b.file_path}`);
    } else if (tmdbMovie.backdrop_path) {
        scenes = [`${TMDB_BACKDROP_BASE}${tmdbMovie.backdrop_path}`];
    }

    const movie = {
        id: tmdbMovie.id ? tmdbMovie.id.toString() : "N/A",
        imdbID: tmdbMovie.id ? tmdbMovie.id.toString() : "N/A",
        title: tmdbMovie.title || tmdbMovie.name || "Unknown",
        Title: tmdbMovie.title || tmdbMovie.name || "Unknown",
        year: year,
        Year: year,
        genres: genres,
        runtime: tmdbMovie.runtime ? `${tmdbMovie.runtime} min` : "90 min",
        director: director,
        actors: actors,
        poster: poster,
        Poster: poster,
        imdbRating: imdbRating,
        imdbVotes: imdbVotes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        plot: tmdbMovie.overview || "No plot summary available.",
        Plot: tmdbMovie.overview || "No plot summary available.",
        watchLink: watchLink,
        scenes: scenes,
        primaryLanguage: tmdbMovie.original_language || "en",
        productionCountries: tmdbMovie.production_countries ? tmdbMovie.production_countries.map(c => c.name || c.iso_3166_1) : []
    };

    // Add region tags
    try {
        const lang = movie.primaryLanguage;
        if (lang && lang !== 'en') {
            const { getRegionForLanguage } = await import('./src/regionData.js');
            const region = getRegionForLanguage(lang);
            if (region) movie.regionTags = [region];
        }
    } catch (e) { }

    return movie;
}

export const api = {
    async searchMovies(query) {
        if (cache.has(`search_${query}`)) return cache.get(`search_${query}`);

        const isTmdbReady = TMDB_API_KEY && TMDB_API_KEY !== "INSERT_TMDB_API_KEY_HERE";

        try {
            if (!isTmdbReady) throw new Error("TMDB Key Missing");
            const res = await fetchWithTimeout(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`);
            if (!res.ok) throw new Error("TMDB failed");
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                const results = await Promise.all(data.results.map(m => normalizeTMDBMovie(m)));
                cache.set(`search_${query}`, results);
                return results;
            }
            return [];
        } catch (e) {
            if (e.message !== "TMDB Key Missing") {
                console.warn("TMDB Search failed, falling back to OMDB:", e);
            }
            try {
                const res = await fetchWithTimeout(`${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}`);
                const data = await res.json();
                if (data.Response === "True") {
                    // OMDB Search doesn't return full details, but enough for a list
                    const results = await Promise.all(data.Search.map(async m => ({
                        ...await normalizeOMDBMovie(m),
                        poster: m.Poster,
                        Poster: m.Poster
                    })));
                    cache.set(`search_${query}`, results);
                    return results;
                }
                return [];
            } catch (fallbackError) {
                console.error("OMDB Fallback Search also failed:", fallbackError);
                return [];
            }
        }
    },

    async fetchMovieById(id) {
        const isTmdbReady = TMDB_API_KEY && TMDB_API_KEY !== "INSERT_TMDB_API_KEY_HERE";
        let fetchUrl = `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,watch/providers,images`;
        let actualId = id;

        if (isTmdbReady && id && id.toString().startsWith('tt')) {
            try {
                const findRes = await fetchWithTimeout(`${TMDB_BASE_URL}/find/${id}?api_key=${TMDB_API_KEY}&external_source=imdb_id`);
                if (findRes.ok) {
                    const findData = await findRes.json();
                    if (findData.movie_results && findData.movie_results.length > 0) {
                        actualId = findData.movie_results[0].id;
                        fetchUrl = `${TMDB_BASE_URL}/movie/${actualId}?api_key=${TMDB_API_KEY}&append_to_response=credits,watch/providers,images`;
                    }
                }
            } catch (e) {
                console.warn("TMDB find failed, will attempt fallback fetch block next:", e);
            }
        }

        if (cache.has(`movie_${actualId}`)) return cache.get(`movie_${actualId}`);

        try {
            if (!isTmdbReady) throw new Error("TMDB Key Missing");
            const res = await fetchWithTimeout(fetchUrl);
            if (!res.ok) throw new Error(`TMDB fetch failed with status ${res.status}`);
            const data = await res.json();

            if (data.id) {
                const normalizedMovie = await normalizeTMDBMovie(data, data.credits, data['watch/providers'], data.images);
                const finalMovie = { ...normalizedMovie, metrics: this.computeMetrics(normalizedMovie) };
                cache.set(`movie_${actualId}`, finalMovie);

                if (actualId.toString() !== id.toString()) {
                    cache.set(`movie_${id}`, finalMovie);
                }

                return finalMovie;
            }
            throw new Error("Invalid TMDB data structure");
        } catch (e) {
            if (e.message !== "TMDB Key Missing") {
                console.warn(`TMDB fetchMovieById failed for ${id}, falling back to OMDB:`, e);
            }
            try {
                // If it's a TMDB internal ID (numbers only), OMDB might not be able to find it directly
                // because OMDB only accepts 'tt...' format for IDs.
                // If id is not 'tt...', we try a title search instead.
                let omdbUrl = id.toString().startsWith('tt')
                    ? `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&i=${id}`
                    : null;

                if (omdbUrl) {
                    const fallbackRes = await fetchWithTimeout(omdbUrl);
                    const fallbackData = await fallbackRes.json();
                    if (fallbackData.Response === "True") {
                        const normalizedMovie = await normalizeOMDBMovie(fallbackData);
                        const finalMovie = { ...normalizedMovie, metrics: this.computeMetrics(normalizedMovie) };
                        cache.set(`movie_${id}`, finalMovie);
                        return finalMovie;
                    }
                }
                return null;
            } catch (fallbackError) {
                console.error("OMDB Fallback fetchMovieById also failed:", fallbackError);
                return null;
            }
        }
    },

    async fetchRawMovieByTitle(title) {
        if (cache.has(`rawtitle_${title}`)) return cache.get(`rawtitle_${title}`);

        // Try TMDB Search First
        const searchRes = await this.searchMovies(title);
        if (searchRes && searchRes.length > 0) {
            const movieDetails = await this.fetchMovieById(searchRes[0].id);
            if (movieDetails) {
                cache.set(`rawtitle_${title}`, movieDetails);
                return movieDetails;
            }
        }

        // TMDB Failed or returned nothing, Fallback to OMDB exact title search
        console.warn(`TMDB title search failed for ${title}, falling back to OMDB...`);
        try {
            const res = await fetchWithTimeout(`${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}`);
            const fallbackData = await res.json();
            if (fallbackData.Response === "True") {
                const normalizedMovie = await normalizeOMDBMovie(fallbackData);
                const finalMovie = { ...normalizedMovie, metrics: this.computeMetrics(normalizedMovie) };
                cache.set(`rawtitle_${title}`, finalMovie);
                return finalMovie;
            }
            return null;
        } catch (fallbackError) {
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
        const cognitiveMap = { 'Mystery': 80, 'Science Fiction': 75, 'Sci-Fi': 75, 'Thriller': 70, 'Documentary': 65, 'Action': 30, 'Comedy': 20 };
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
        return await this.fetchRawMovieByTitle(title);
    },

    async fetchPopularMoviesBatch() {
        // TMDB allows getting trending directly, bypassing the need to search specific titles manually!
        const isTmdbReady = TMDB_API_KEY && TMDB_API_KEY !== "INSERT_TMDB_API_KEY_HERE";
        try {
            if (!isTmdbReady) throw new Error("TMDB Key Missing");
            const res = await fetchWithTimeout(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                // Return normalized basic data for many movies quickly
                return await Promise.all(data.results.slice(0, 24).map(m => normalizeTMDBMovie(m)));
            }
            return [];
        } catch (e) {
            if (e.message === "TMDB Key Missing") {
                console.info("TMDB key not found, using OMDb fallback engine.");
            } else {
                console.warn("fetchPopularMoviesBatch TMDB error:", e);
            }
            const popularMovies = [
                "Deadpool & Wolverine", "Inside Out 2", "Dune: Part Two",
                "Oppenheimer", "Poor Things", "The Fall Guy", "Furiosa: A Mad Max Saga",
                "Kingdom of the Planet of the Apes", "Challengers", "Civil War",
                "The Batman", "Spider-Man: Across the Spider-Verse", "Barbie"
            ];
            const detailed = await Promise.all(
                popularMovies.map(title => this.fetchMovieByTitle(title))
            );
            return detailed.filter(m => m !== null);
        }
    },

    async fetchHiddenGemsBatch() {
        // Without TMDB discovery, we use a curated list of high-quality "gems"
        const isTmdbReady = TMDB_API_KEY && TMDB_API_KEY !== "INSERT_TMDB_API_KEY_HERE";
        try {
            if (isTmdbReady) {
                // Fetch high rated but slightly less popular movies
                const res = await fetchWithTimeout(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=vote_average.desc&vote_count.gte=500&with_original_language=en&page=1`);
                const data = await res.json();
                if (data.results) return await Promise.all(data.results.slice(0, 12).map(m => normalizeTMDBMovie(m)));
            }
            throw new Error("Using fallback gems");
        } catch (e) {
            const gems = [
                "The Holdovers", "The Zone of Interest", "Past Lives",
                "Anatomy of a Fall", "Everything Everywhere All at Once",
                "Aftersun", "Portrait of a Lady on Fire", "Whiplash",
                "The Night of the Hunter", "Paths of Glory"
            ];
            const detailed = await Promise.all(
                gems.map(title => this.fetchMovieByTitle(title))
            );
            return detailed.filter(m => m !== null);
        }
    }
};
