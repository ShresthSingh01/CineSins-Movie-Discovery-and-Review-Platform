const express = require('express');
const router = express.Router();
const axios = require('axios');
const Movie = require('../models/Movie');

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE_URL = "https://www.omdbapi.com";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;


// --- Helper Functions to normalize OMDB objects to our format ---
function normalizeOMDBMovie(omdbMovie) {
    const movie = {
        _id: omdbMovie.imdbID,
        title: omdbMovie.Title || "Unknown",
        poster: omdbMovie.Poster,
        genres: omdbMovie.Genre,
        director: omdbMovie.Director,
        year: omdbMovie.Year,
        metrics: computeMetrics(omdbMovie.Genre),
        plot: omdbMovie.Plot,
        imdbRating: omdbMovie.imdbRating,
        type: omdbMovie.Type || "movie"
    };
    return movie;
}

function computeMetrics(genresStr) {
    const genres = (genresStr || '').split(',').map(g => g.trim());
    let emotionalIntensity = 50;
    let cognitiveLoad = 50;
    let comfortScore = 50;

    if (genres.some(g => ['Drama', 'Thriller', 'Action', 'Horror'].includes(g))) emotionalIntensity += 20;
    if (genres.some(g => ['Comedy', 'Family', 'Animation'].includes(g))) emotionalIntensity -= 10;
    if (genres.some(g => ['Sci-Fi', 'Mystery', 'Documentary'].includes(g))) cognitiveLoad += 20;
    if (genres.some(g => ['Comedy', 'Romance', 'Animation', 'Family'].includes(g))) comfortScore += 30;
    if (genres.some(g => ['Horror', 'Thriller'].includes(g))) comfortScore -= 20;

    return {
        emotionalIntensity: Math.min(100, Math.max(0, emotionalIntensity)),
        cognitiveLoad: Math.min(100, Math.max(0, cognitiveLoad)),
        comfortScore: Math.min(100, Math.max(0, comfortScore))
    };
}

// Search Movies
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(400).json({ message: 'Query required' });

        const url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie`;
        const response = await axios.get(url);

        if (response.data.Response === "False") {
            return res.json([]);
        }

        // OMDB Search returns limited data, fetch full details for tops results
        const basicResults = response.data.Search.slice(0, 10);

        const detailedResults = await Promise.all(basicResults.map(async (m) => {
            const detailRes = await axios.get(`${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${m.imdbID}`);
            return normalizeOMDBMovie(detailRes.data);
        }));

        // Cache these locally in MongoDB asynchronously
        detailedResults.forEach(m => {
            if (m._id) {
                Movie.findByIdAndUpdate(m._id, m, { upsert: true }).catch(err => console.error("Cache error", err));
            }
        });

        res.json(detailedResults);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching from OMDB', error: err.message });
    }
});

// Real-time Trending Movies (Via Gemini + OMDB)
router.get('/trending/week', async (req, res) => {
    try {
        // Step 1: Ask Gemini for current trending movies and shows
        let trendingTitles = [];
        try {
            const prompt = "What are the top 30 most popular and trending movies and TV shows globally right now? BE SURE to include at least two prominent titles from EACH of these genres: Action, Comedy, Drama, Horror, Sci-Fi, Romance, Thriller, Animation, and Documentary. Return ONLY a JSON array of strings containing just the absolute titles. Example: [\"Dune: Part Two\", \"Shogun\", \"Talk to Me\", \"Past Lives\", \"Planet Earth\"]";

            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.2, maxOutputTokens: 800 }
            };

            const geminiRes = await axios.post(GEMINI_ENDPOINT, payload, {
                headers: { "Content-Type": "application/json" }
            });

            const textToParse = geminiRes.data.candidates[0].content.parts[0].text;
            let cleaned = textToParse.replace(/```json/gi, '').replace(/```/g, '').trim();
            trendingTitles = JSON.parse(cleaned);
        } catch (e) {
            console.error("Gemini API error (likely 429 Rate Limit):", e.response ? e.response.data : e.message);
            // Fallback to a highly diverse list of 30 items so that all UI filters (Horror, Romance, Documentary, etc) will yield results
            const fallbacks = [
                "Dune: Part Two", "Shogun", "Talk to Me", "Past Lives", "The Last Dance",
                "Spider-Man: Across the Spider-Verse", "Everything Everywhere All at Once",
                "Leave the World Behind", "The Bear", "Barbie", "Smile", "Anyone But You",
                "Avatar: The Way of Water", "Parasite", "Get Out", "The Batman", "Oppenheimer",
                "Top Gun: Maverick", "The Grand Budapest Hotel", "Interstellar", "Mad Max: Fury Road",
                "Arrival", "Knives Out", "Hereditary", "Midsommar", "La La Land",
                "Planet Earth II", "Free Solo", "The Tinder Swindler", "Spirited Away"
            ];
            // Shuffle array to make it feel fresh even on fallback
            trendingTitles = fallbacks.sort(() => 0.5 - Math.random()).slice(0, 30);
        }

        // Step 2: Fetch details for these titles from OMDB
        const detailedResults = [];
        for (const title of trendingTitles) {
            const url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}`;
            const response = await axios.get(url);

            if (response.data.Response !== "False") {
                const normalized = normalizeOMDBMovie(response.data);
                detailedResults.push(normalized);

                // Cache asynchronously
                Movie.findByIdAndUpdate(normalized._id, normalized, { upsert: true }).catch(err => console.error(err));
            }
        }

        res.json(detailedResults);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching real-time trending', error: err.message });
    }
});

// Get Single Movie by ID
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // First check our cache briefly
        let movieRecord = await Movie.findById(id);

        // If it's missing or older than 7 days, fetch from OMDB
        const isStale = movieRecord && ((Date.now() - movieRecord.lastFetched.getTime()) > 7 * 24 * 60 * 60 * 1000);

        if (!movieRecord || isStale) {
            const url = `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${id}&plot=full`;
            const response = await axios.get(url);

            if (response.data.Response === "False") {
                return res.status(404).json({ message: "Movie not found in OMDB" });
            }

            const normalized = normalizeOMDBMovie(response.data);
            normalized.lastFetched = Date.now();

            movieRecord = await Movie.findByIdAndUpdate(id, normalized, { new: true, upsert: true });
        }

        res.json(movieRecord);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching movie details', error: err.message });
    }
});


module.exports = router;
