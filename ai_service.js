import { config } from './config.js';

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const aiService = {
    async generateResponse(prompt, systemInstruction = "") {
        const apiKey = config.GEMINI_API_KEY;
        const isReady = apiKey && apiKey !== "INSERT_GEMINI_API_KEY_HERE";

        if (!isReady) {
            console.warn("Gemini API Key missing. Using CineMind Mock Intelligence.");
            return this.mockThink(prompt);
        }

        try {
            const body = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            };

            if (systemInstruction) {
                body.system_instruction = { parts: [{ text: systemInstruction }] };
            }

            const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Gemini API HTTP Error:", response.status, errorData);
                return this.mockThink(prompt);
            }

            const data = await response.json();

            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            }

            console.error("Unexpected Gemini response structure:", data);
            return this.mockThink(prompt);
        } catch (err) {
            console.error("AI Service Error:", err);
            return this.mockThink(prompt);
        }
    },

    async getMovieRecommendations(userQuery, history = []) {
        const systemPrompt = `You are a movie recommendation engine. 
        Respond ONLY with a valid JSON array of movie objects. No markdown, no explanation.
        Each object must have exactly: title (string), year (string), reason (string, 1 sentence).
        Recommend 5 movies. Example format:
        [{"title":"Inception","year":"2010","reason":"A mind-bending thriller about dream manipulation."}]`;

        const responseText = await this.generateResponse(userQuery, systemPrompt);

        try {
            // Try to extract JSON array from the response
            const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
                    return parsed;
                }
            }

            // Try parsing the whole response as JSON
            const directParse = JSON.parse(responseText);
            if (Array.isArray(directParse)) return directParse;
        } catch (e) {
            console.warn("Failed to parse AI JSON, trying to extract titles:", responseText);
        }

        // Last resort: try to extract movie titles from plain text
        try {
            const titleMatches = responseText.match(/[""]([^""]+)[""].*?(\d{4})/g);
            if (titleMatches && titleMatches.length > 0) {
                return titleMatches.slice(0, 5).map(match => {
                    const parts = match.match(/[""]([^""]+)[""].*?(\d{4})/);
                    return { title: parts[1], year: parts[2], reason: "AI recommended." };
                });
            }
        } catch (e) { /* ignore */ }

        // If all parsing fails, return curated fallback based on query keywords
        return this.getFallbackRecommendations(userQuery);
    },

    /**
     * AI-powered Spotlight: Interprets a natural language vibe description
     * and returns exactly 3 curated movie picks with reasons.
     */
    async getSpotlightRecommendations(vibeQuery) {
        const systemPrompt = `You are CineMind, an elite film curator AI. The user will describe their current mood, vibe, or what kind of movie experience they want tonight.
Your job: Return EXACTLY 3 perfect movie recommendations.
Respond ONLY with a valid JSON array. No markdown, no explanation, no wrapping.
Each object must have: title (string), year (string), reason (string - 1 compelling sentence explaining WHY this movie fits their vibe).
Focus on quality over popularity. Mix well-known films with hidden gems when appropriate.
Example: [{"title":"Mulholland Drive","year":"2001","reason":"A hypnotic neo-noir that unravels reality in the most unsettling way."}]`;

        const responseText = await this.generateResponse(vibeQuery, systemPrompt);

        try {
            const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
                    return parsed.slice(0, 3);
                }
            }
            const directParse = JSON.parse(responseText);
            if (Array.isArray(directParse)) return directParse.slice(0, 3);
        } catch (e) {
            console.warn("Spotlight AI parse failed, using fallback:", responseText);
        }

        // Fallback: use the general recommendation engine
        const fallback = this.getFallbackRecommendations(vibeQuery);
        return fallback.slice(0, 3);
    },

    getFallbackRecommendations(query) {
        const q = query.toLowerCase();

        if (q.includes("thriller") || q.includes("suspense") || q.includes("crime")) {
            return [
                { title: "Se7en", year: "1995", reason: "A dark crime thriller with a shocking finale." },
                { title: "Zodiac", year: "2007", reason: "Obsessive pursuit of a real-life serial killer." },
                { title: "Prisoners", year: "2013", reason: "Intense moral dilemma wrapped in suspense." },
                { title: "No Country for Old Men", year: "2007", reason: "A relentless cat-and-mouse chase through Texas." },
                { title: "Gone Girl", year: "2014", reason: "A marriage mystery that keeps you guessing." }
            ];
        }
        if (q.includes("sci-fi") || q.includes("space") || q.includes("future")) {
            return [
                { title: "Interstellar", year: "2014", reason: "An epic voyage through space and time." },
                { title: "Blade Runner 2049", year: "2017", reason: "A visually stunning sci-fi detective story." },
                { title: "Arrival", year: "2016", reason: "A linguist decodes alien communication." },
                { title: "Ex Machina", year: "2014", reason: "A tense exploration of artificial intelligence." },
                { title: "The Martian", year: "2015", reason: "A stranded astronaut's fight for survival." }
            ];
        }
        if (q.includes("comedy") || q.includes("funny") || q.includes("laugh")) {
            return [
                { title: "The Grand Budapest Hotel", year: "2014", reason: "Wes Anderson's most charming caper." },
                { title: "Superbad", year: "2007", reason: "A hilarious high school coming-of-age comedy." },
                { title: "The Big Lebowski", year: "1998", reason: "The Dude abides in this cult classic." },
                { title: "In Bruges", year: "2008", reason: "Dark comedy gold in a medieval Belgian city." },
                { title: "Game Night", year: "2018", reason: "A game night spirals into real-life chaos." }
            ];
        }
        if (q.includes("horror") || q.includes("scary") || q.includes("creepy")) {
            return [
                { title: "Hereditary", year: "2018", reason: "A family unravels under supernatural horror." },
                { title: "Get Out", year: "2017", reason: "Social horror that rewrites the genre." },
                { title: "The Shining", year: "1980", reason: "Kubrick's masterpiece of isolation and madness." },
                { title: "Midsommar", year: "2019", reason: "Folk horror bathed in unsettling daylight." },
                { title: "It Follows", year: "2014", reason: "A relentless, dream-like supernatural threat." }
            ];
        }
        if (q.includes("romance") || q.includes("love") || q.includes("feel-good")) {
            return [
                { title: "Before Sunrise", year: "1995", reason: "Two strangers connect over one magical night." },
                { title: "La La Land", year: "2016", reason: "A dreamy musical romance in modern LA." },
                { title: "Eternal Sunshine of the Spotless Mind", year: "2004", reason: "A bittersweet love story about memory." },
                { title: "About Time", year: "2013", reason: "Time travel meets heartfelt family love." },
                { title: "Crazy Rich Asians", year: "2018", reason: "A luxurious, heartwarming romantic comedy." }
            ];
        }
        // Generic fallback
        return [
            { title: "Inception", year: "2010", reason: "A mind-bending journey through dream layers." },
            { title: "Parasite", year: "2019", reason: "A genre-defying masterpiece about class." },
            { title: "The Shawshank Redemption", year: "1994", reason: "A timeless story of hope and friendship." },
            { title: "Whiplash", year: "2014", reason: "An intense battle between ambition and mentorship." },
            { title: "Mad Max: Fury Road", year: "2015", reason: "Non-stop vehicular action in a dystopia." }
        ];
    },

    async analyzeReviewSentiment(reviewText) {
        const prompt = `Analyze this movie review and return exactly two words: one emoji and one vibe name (e.g. "🔥 Masterpiece", "🎭 Emotional", "😴 Boring"). Review: "${reviewText}"`;
        return await this.generateResponse(prompt, "You are a sentiment analysis expert.");
    },

    // Mock Intelligence for when no API key is present
    async mockThink(prompt) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const p = prompt.toLowerCase();
                if (p.includes("recommend") || p.includes("movie") || p.includes("find") || p.includes("suggest") || p.includes("[") || p.includes("json")) {
                    resolve(JSON.stringify([
                        { title: "Inception", year: "2010", reason: "Complex narrative layers for the curious mind." },
                        { title: "The Grand Budapest Hotel", year: "2014", reason: "Whimsical storytelling with visual perfection." },
                        { title: "Blade Runner 2049", year: "2017", reason: "A visual masterpiece for thoughtful viewers." },
                        { title: "Parasite", year: "2019", reason: "A genre-bending social commentary." },
                        { title: "Whiplash", year: "2014", reason: "Relentless tension between ambition and obsession." }
                    ]));
                } else {
                    resolve("As an AI-powered engine, I recommend exploring films that challenge your perspective! (Add your Gemini API key in config.js to unlock my full potential)");
                }
            }, 800);
        });
    }
};
