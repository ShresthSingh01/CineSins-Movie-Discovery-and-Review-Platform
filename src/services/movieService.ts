"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const USER_OMDB_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY;
const FALLBACK_OMDB_KEY = "thewdb";

// Use user key if provided and not known to be invalid/empty, else use fallback
const OMDB_API_KEY = (USER_OMDB_KEY && USER_OMDB_KEY !== "400f1b83") ? USER_OMDB_KEY : FALLBACK_OMDB_KEY;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export interface Movie {
    id: string; // IMDb ID
    title: string;
    year: string;
    poster: string;
    type?: string;
    rating?: string;
    sinScore?: number;
    sinSentence?: string;
    plot?: string;
    Runtime?: string;
    Genre?: string;
    Director?: string;
    Actors?: string;
    imdbRating?: string;
    Metascore?: string;
    logicGaps?: string[];
    oracleReason?: string;
}

export async function calculateSinScore(imdbRating: string, metascore: string, aiConfidence: number = 0): Promise<number> {
    const imdb = parseFloat(imdbRating) || 5.0;
    const meta = parseInt(metascore) || 50;

    // Base score from IMDb (0-10 scale flipped and boosted to 430 max)
    const imdbPenalty = Math.max(0, (10 - imdb) * 43);

    // Metacritic modifier (0-100 scale flipped and boosted to 150 max)
    const metaPenalty = Math.max(0, (100 - meta) * 1.5);

    // AI Sin Multiplier (Random base for trending, will be precise in Audit)
    const aiModifier = aiConfidence > 0 ? aiConfidence : (Math.random() * 50);

    return Math.floor(imdbPenalty + metaPenalty + aiModifier + 12);
}

export async function getTrendingMovies(): Promise<Movie[]> {
    try {
        if (!genAI) {
            return await searchMovies("Inception");
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Return a JSON array of 12 famous or currently popular movie titles that would be interesting to analyze for cinematic "sins". ONLY the JSON array of strings. No markdown formatting.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const titles = JSON.parse(text.replace(/```json|```/g, "").trim());

        const movies = await Promise.all(
            titles.map(async (title: string) => {
                const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);
                const data = await res.json();
                if (data.Response === "True") {
                    const sinScore = await calculateSinScore(data.imdbRating, data.Metascore);
                    return {
                        id: data.imdbID,
                        title: data.Title,
                        year: data.Year,
                        poster: data.Poster !== "N/A" ? data.Poster : "/placeholder-movie.png",
                        type: data.Type,
                        rating: data.imdbRating,
                        Genre: data.Genre,
                        Director: data.Director,
                        plot: data.Plot,
                        Metascore: data.Metascore,
                        sinScore
                    };
                }
                return null;
            })
        );

        return movies.filter((m): m is Movie => m !== null);
    } catch (error) {
        return await searchMovies("Batman");
    }
}

export async function searchMovies(query: string): Promise<Movie[]> {
    try {
        const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${OMDB_API_KEY}`);
        const data = await res.json();
        if (data.Response === "True") {
            const movies = await Promise.all(
                data.Search.slice(0, 8).map(async (m: any) => {
                    const detailRes = await fetch(`https://www.omdbapi.com/?i=${m.imdbID}&apikey=${OMDB_API_KEY}`);
                    const detailData = await detailRes.json();
                    const sinScore = await calculateSinScore(detailData.imdbRating, detailData.Metascore);
                    return {
                        id: m.imdbID,
                        title: m.Title,
                        year: m.Year,
                        poster: m.Poster !== "N/A" ? m.Poster : "/placeholder-movie.png",
                        type: m.Type,
                        rating: detailData.imdbRating || 'N/A',
                        Genre: detailData.Genre,
                        Director: detailData.Director,
                        Metascore: detailData.Metascore,
                        sinScore
                    };
                })
            );
            return movies;
        }
        return [];
    } catch (error) {
        return [];
    }
}

export async function getMovieDetails(id: string) {
    try {
        const res = await fetch(`https://www.omdbapi.com/?i=${id}&plot=full&apikey=${OMDB_API_KEY}`);
        const data = await res.json();
        return data.Response === "True" ? data : null;
    } catch (error) {
        return null;
    }
}

export async function getDetentionBlock(): Promise<Movie[]> {
    try {
        if (!genAI) {
            return await searchMovies("Cats");
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Return a JSON array of 8 famously bad or low-rated movie titles (cinematic disasters). ONLY the JSON array of strings. No markdown formatting.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const titles = JSON.parse(text.replace(/```json|```/g, "").trim());

        const movies = await Promise.all(
            titles.map(async (title: string) => {
                const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);
                const data = await res.json();
                if (data.Response === "True") {
                    const sinScore = await calculateSinScore(data.imdbRating, data.Metascore);
                    return {
                        id: data.imdbID,
                        title: data.Title,
                        year: data.Year,
                        poster: data.Poster !== "N/A" ? data.Poster : "/placeholder-movie.png",
                        type: data.Type,
                        rating: data.imdbRating,
                        Genre: data.Genre,
                        Director: data.Director,
                        plot: data.Plot,
                        Metascore: data.Metascore,
                        sinScore
                    };
                }
                return null;
            })
        );

        return movies.filter((m): m is Movie => m !== null);
    } catch (error) {
        console.error("Detention Block Error:", error);
        // Robust fallback with diverse famously bad films
        const disasters = ["The Room", "Cats", "Birdemic: Shock and Terror", "Batman & Robin", "The Emoji Movie", "Battlefield Earth", "Plan 9 from Outer Space", "Superbabies: Baby Geniuses 2"];
        const fallbackMovies = await Promise.all(
            disasters.map(async (title) => {
                const res = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`);
                const data = await res.json();
                if (data.Response === "True") {
                    const sinScore = await calculateSinScore(data.imdbRating, data.Metascore);
                    const movie: Movie = {
                        id: data.imdbID,
                        title: data.Title,
                        year: data.Year,
                        poster: data.Poster !== "N/A" ? data.Poster : "/placeholder-movie.png",
                        type: data.Type,
                        rating: data.imdbRating,
                        Genre: data.Genre,
                        Director: data.Director,
                        plot: data.Plot,
                        Metascore: data.Metascore,
                        sinScore
                    };
                    return movie;
                }
                return null;
            })
        );
        return (fallbackMovies.filter((m) => m !== null) as Movie[]);
    }
}

export async function getForensicAnalysis(title: string, year: string, plot: string) {
    if (!genAI) return { sinScore: 0, sinSentence: "Forensic brain offline.", breakdown: {} };

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Analyze the movie "${title}" released in ${year}. Plot: ${plot}.
      Acting as the CineSins Forensic AI, provide:
      1. A "sinScore" between 0 and 999.
      2. A single, witty, cynical "sinSentence" summarizing its biggest crime.
      3. A JSON "breakdown" of flaws (0-100) for: Plot, Acting, Logic, Tone, Technical.
      4. A JSON array "crimes" containing 3 specific, witty "charges" (plot holes or failures) as objects with {id, description, severity}.
      Return ONLY valid JSON.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const data = JSON.parse(text.replace(/```json|```/g, "").trim());

        // Ensure crimes exist even if AI fails to format properly
        if (!data.crimes) {
            data.crimes = [
                { id: 1, description: "Generic cinematic deviation detected.", severity: "Moderate" },
                { id: 2, description: "Logical inconsistencies in character motivation.", severity: "High" },
                { id: 3, description: "Unnecessary narrative padding identified.", severity: "Low" }
            ];
        }
        return data;
    } catch (error) {
        console.error("Forensic Analysis Error:", error);
        return {
            sinScore: 404,
            sinSentence: "Evidence lost in the void. Tactical fallback engaged.",
            breakdown: { Plot: 50, Acting: 50, Tone: 50, Logic: 50, Technical: 50 },
            crimes: [
                { id: 1, description: "Corrupted forensic data prevents specific indictment.", severity: "Critical" },
                { id: 2, description: "Generic cinematic deviation detected by oversight.", severity: "Moderate" },
                { id: 3, description: "Subject remains uncalibrated due to data void.", severity: "Low" }
            ]
        };
    }
}

export async function getOracleRecommendation(moodAnswers: string[], history: string[] = []) {
    const fallbacks = [
        { title: "Blade Runner 2049", oracleReason: "Visual saturation matches your high-contrast era preference." },
        { title: "The Lighthouse", oracleReason: "Matched your melancholy frequency with vintage grain aesthetics." },
        { title: "Seven", oracleReason: "Your darkness tolerance matches this pitch-black diagnostic." },
        { title: "Mad Max: Fury Road", oracleReason: "Chaotic frequency identified. High-octane narrative gravity detected." },
        { title: "Fight Club", oracleReason: "Moral compass alignment: Total Corruption. Perfect match." }
    ];

    if (!genAI) return fallbacks;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const historyContext = history.length > 0
            ? `\nAGENT HISTORY: The user has recently indicted/deported these movies: [${history.join(", ")}]. AVOID these titles. Do NOT recommend them.`
            : "";

        const prompt = `
            You are the CINESINS ORACLE. You analyze human cinematic frequencies with cynical precision.

            FORENSIC CALIBRATION DATA:
            ${moodAnswers.map((a, i) => `Sequence ${i + 1}: ${a}`).join('\n')}

            ${historyContext}

            INTERPRETATION PARAMETERS:
            - Chaotic: High-energy, non-linear, unpredictable.
            - Melancholy: Atmospheric, slow-paced, emotional weight.
            - Pitch Black: Extreme nihilism, horror, or dark thrillers.
            - Neon Noir: Stylized, high-contrast, cyberpunk or crime.
            - Modern Forensic: Recent cinema, crisp digital aesthetics.
            - Vintage Grain: 70s/80s gritty texture.
            - Singularity: Reality-bending, philosophical, high narrative gravity.
            - Silent Void: Meditative, minimal dialogue, visual storytelling.

            TASK:
            Recommend 4 movies that perfectly align with this calibration profile. Provide a witty, cynical, CineSins-style "oracleReason" for each (max 15 words) that explains why it matches their data.

            Return ONLY a JSON array of objects: [{"title": "...", "oracleReason": "..."}]
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const data = JSON.parse(text.replace(/```json|```/g, "").trim());
        return data;
    } catch (error) {
        console.error("Oracle AI Error:", error);
        return fallbacks;
    }
}
