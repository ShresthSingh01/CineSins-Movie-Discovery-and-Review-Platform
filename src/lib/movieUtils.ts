// src/lib/movieUtils.ts
import { Movie, MovieMetrics, UserStats } from './types';

export function computeMetrics(movie: Partial<Movie>): MovieMetrics {
    const genres = movie.normalizedGenres || [];
    const rating = Math.min(10, Math.max(0, movie.imdbRatingFloat || 5.0));
    const runtime = Math.max(0, movie.runtimeMin || 90);

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

export function normalizeMovieData(movie: any): Movie | null {
    if (!movie || typeof movie !== 'object') return null;

    const normalized = { ...movie };

    // Ensure id exists
    if (!normalized.id && normalized._id) normalized.id = String(normalized._id);
    if (!normalized.imdbID && normalized._id) normalized.imdbID = String(normalized._id);
    if (!normalized.id && normalized.imdbID) normalized.id = String(normalized.imdbID);

    // Standardize fields
    normalized.title = normalized.title || normalized.Title;
    normalized.poster = normalized.poster || normalized.Poster;
    normalized.genres = normalized.genres || normalized.Genre || "";
    normalized.year = normalized.year || normalized.Year;
    normalized.director = normalized.director || normalized.Director;

    // Create new normalized properties
    normalized.normalizedGenres = normalized.genres.split(',').map((g: string) => g.trim()).filter(Boolean);

    const runtimeStr = String(normalized.runtime || normalized.Runtime || "0");
    const runtimeMatch = runtimeStr.match(/\d+/);
    normalized.runtimeMin = runtimeMatch ? parseInt(runtimeMatch[0], 10) : 0;

    normalized.imdbRatingFloat = parseFloat(normalized.imdbRating || "0") || 0;
    normalized.imdbVotesInt = parseInt(String(normalized.imdbVotes || "0").replace(/,/g, '')) || 0;

    // Attach core metrics
    normalized.metrics = computeMetrics(normalized);

    return normalized;
}

export function computeCompatibility(personAMovies: Movie[], personBMovies: Movie[]) {
    const getGenres = (movies: Movie[]) => [...new Set(movies.flatMap(m => (m.genres || '').split(',').map(g => g.trim())))];
    const getDirectors = (movies: Movie[]) => [...new Set(movies.flatMap(m => (m.director || '').split(',').map(d => d.trim())))];

    const aGenres = getGenres(personAMovies);
    const bGenres = getGenres(personBMovies);
    const commonGenres = aGenres.filter(g => bGenres.includes(g) && g);

    const aDirs = getDirectors(personAMovies);
    const bDirs = getDirectors(personBMovies);
    const commonDirs = aDirs.filter(d => bDirs.includes(d) && d && d !== "N/A");

    const getAvgMetrics = (movies: Movie[]) => {
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

    let score = 10;
    if (commonGenres.length > 0) score += Math.min(50, commonGenres.length * 15);
    if (commonDirs.length > 0) score += Math.min(10, commonDirs.length * 5);
    score += Math.max(0, 30 - (distance / 300) * 30);

    const percentage = Math.min(100, Math.round(score));

    return {
        percentage,
        commonGenres,
        distanceMetrics: Math.round(distance),
    };
}

export function computeHiddenScores(movies: Movie[]): Movie[] {
    return movies.map(m => {
        const rating = m.imdbRatingFloat || 0;
        const votes = m.imdbVotesInt || 0;
        if (rating > 0 && votes > 0) {
            m.hiddenScore = rating / Math.log(1 + votes);
        } else {
            m.hiddenScore = 0;
        }
        return m;
    });
}

export function getHighResPoster(url: string | undefined): string {
    const fallback = "https://placehold.co/300x450/111/555?text=No+Poster";
    if (!url || url === "N/A" || url.includes("placehold.co")) return fallback;

    let highRes = url;
    if (url.includes("omdbapi.com")) {
        highRes = url.replace(/SX\d+/, 'SX1000');
    } else if (url.includes("tmdb.org")) {
        highRes = url.replace(/\/w\d+\//, '/original/');
    }
    return highRes;
}

export function computeUserAnalytics(reviews: any[], allMovies: Movie[]): UserStats {
    const movieMap = new Map(allMovies.map(m => [String(m.imdbID || m._id || m.id), m]));

    const userMovies = reviews.map(r => {
        const id = String(r.id);
        if (movieMap.has(id)) {
            return movieMap.get(id);
        } else {
            return normalizeMovieData({
                id: r.id,
                title: r.title,
                poster: r.poster,
                genres: r.genre || "Drama",
            });
        }
    }) as Movie[];

    const genreCounts: Record<string, number> = {};
    const directorCounts: Record<string, number> = {};
    let totalRating = 0;
    let validRatingCount = 0;
    let totalEmotional = 0;
    let validEmotionalCount = 0;
    let totalCognitive = 0;
    let totalComfort = 0;
    let validCognitiveCount = 0;
    let validComfortCount = 0;
    let oldMovieCount = 0;
    let totalHiddenScore = 0;

    userMovies.forEach(m => {
        if (!m) return;

        const genres = m.normalizedGenres || [];
        genres.forEach(g => {
            genreCounts[g] = (genreCounts[g] || 0) + 1;
        });

        const directors = (m.director || '').split(',').map(d => d.trim()).filter(Boolean);
        directors.forEach(d => {
            if (d && d !== "N/A") {
                directorCounts[d] = (directorCounts[d] || 0) + 1;
            }
        });

        if (m.metrics) {
            totalEmotional += m.metrics.emotionalIntensity || 0;
            validEmotionalCount++;
            totalCognitive += m.metrics.cognitiveLoad || 0;
            validCognitiveCount++;
            totalComfort += m.metrics.comfortScore || 0;
            validComfortCount++;
        }

        const year = parseInt(String(m.year || m.Year || ""));
        if (year && !isNaN(year) && year < 2000) oldMovieCount++;

        if (m.hiddenScore) totalHiddenScore += m.hiddenScore;
    });

    reviews.forEach(r => {
        if (r && r.rating !== undefined && !isNaN(r.rating)) {
            totalRating += Number(r.rating);
            validRatingCount++;
        }
    });

    const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
    const favoriteGenre = sortedGenres.length > 0 ? sortedGenres[0][0] : "N/A";

    const sortedDirectors = Object.entries(directorCounts).sort((a, b) => b[1] - a[1]);
    const top5Directors = sortedDirectors.slice(0, 5).map(d => d[0]);

    const avgRating = validRatingCount > 0 ? (totalRating / validRatingCount).toFixed(1) : "0.0";
    const avgEmotional = validEmotionalCount > 0 ? Math.round(totalEmotional / validEmotionalCount) : 50;
    const avgCognitive = validCognitiveCount > 0 ? Math.round(totalCognitive / validCognitiveCount) : 50;
    const avgComfort = validComfortCount > 0 ? Math.round(totalComfort / validComfortCount) : 50;

    let moodTrend = "Neutral";
    if (avgEmotional > 70) moodTrend = "Intense/Exciting";
    else if (avgEmotional > 40) moodTrend = "Balanced";
    else if (avgEmotional > 0) moodTrend = "Calm/Relaxed";

    return {
        totalMoviesSaved: userMovies.length,
        favoriteGenre,
        genreCounts,
        avgRating,
        totalReviews: reviews.length,
        top5Directors,
        moodTrend,
        avgEmotional,
        avgCognitive,
        avgComfort,
        percentOlderDecades: userMovies.length > 0 ? oldMovieCount / userMovies.length : 0,
        hiddenGemAffinity: userMovies.length > 0 ? totalHiddenScore / userMovies.length : 0,
        rewatchRate: 0.2
    };
}
