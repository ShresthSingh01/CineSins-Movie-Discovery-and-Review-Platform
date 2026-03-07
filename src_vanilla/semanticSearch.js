/**
 * SemanticSearch - Client-side intent parsing for smarter movie discovery.
 */

import { config } from '../config.js';

const VIOLENCE_WORDS = ["violent", "gore", "blood", "brutal"];

/**
 * Parses user query into structured filters.
 */
export async function parseQueryToFilters(query, opts = {}) {
    const q = query.toLowerCase();

    // Mode 1: LLM (if API key present)
    const apiKey = config.OPENAI_API_KEY || (typeof process !== 'undefined' ? process.env.OPENAI_API_KEY : null);
    if (apiKey && apiKey !== "INSERT_OPENAI_API_KEY_HERE") {
        try {
            return await llmParse(query, apiKey);
        } catch (e) {
            console.warn("LLM Semantic Parse failed, falling back to heuristic:", e);
        }
    }

    // Mode 2: Heuristic Fallback
    return heuristicParse(q);
}

/**
 * Heuristic parsing logic based on keyword mapping.
 */
function heuristicParse(query) {
    const filters = {
        mood: "Comfort", // Default
        maxRuntime: 500,
        minComfort: null,
        maxCognitive: null,
        minCognitive: null,
        minEmotional: null,
        preferGenres: [],
        negated: query.includes("not too") || query.includes("without") || query.includes("no ")
    };

    // Violence check
    if (VIOLENCE_WORDS.some(w => query.includes(w))) {
        if (filters.negated) {
            filters.minComfort = 0.6;
            filters.maxCognitive = 0.5;
        } else {
            filters.minCognitive = 0.7;
            filters.maxComfort = 0.4;
        }
    }

    // Mood mapping
    if (query.includes("feel-good") || query.includes("light") || query.includes("funny")) {
        filters.mood = "Comfort";
        filters.minComfort = 0.6;
    }
    if (query.includes("heartbreaking") || query.includes("emotional")) {
        filters.mood = "Thoughtful";
        filters.minEmotional = 0.7;
    }
    if (query.includes("mindbending") || query.includes("dark") || query.includes("thought-provoking")) {
        filters.mood = "Thoughtful";
        filters.minCognitive = 0.7;
    }

    // Time phrases
    if (query.includes("short") || query.includes("90 min") || query.includes("under 90")) {
        filters.maxRuntime = 90;
    } else if (query.includes("under 2 hours") || query.includes("under 120")) {
        filters.maxRuntime = 120;
    }

    // Genre extraction (simple)
    const genreMap = {
        "sci-fi": "Sci-Fi",
        "comedy": "Comedy",
        "horror": "Horror",
        "drama": "Drama",
        "thriller": "Thriller"
    };
    Object.keys(genreMap).forEach(g => {
        if (query.includes(g)) filters.preferGenres.push(genreMap[g]);
    });

    return filters;
}

/**
 * (Optional) LLM Parsing using OpenAI
 * Note: Assumes a chat-style completion for intent extraction.
 */
async function llmParse(query, apiKey) {
    const prompt = `Convert the following user movie search query into a JSON filter object.
Query: "${query}"
Return only JSON in this format:
{ "mood": "Comfort|Vibing|Good|Exciting|Thoughtful", "maxRuntime": integer, "minComfort": float(0-1), "minCognitive": float(0-1), "preferGenres": string[], "avoidGenres": string[] }`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: "You are a movie intent parser. Return JSON only." }, { role: "user", content: prompt }],
            temperature: 0
        })
    });

    if (!response.ok) throw new Error("OpenAI API error");
    const data = await response.json();
    const content = data.choices[0].message.content;
    const cleanJson = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
    return JSON.parse(cleanJson);
}
