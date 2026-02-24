import { config } from './config.js';

const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export const aiService = {
    async generateResponse(prompt, systemInstruction = "") {
        const apiKey = config.GEMINI_API_KEY;
        const isReady = apiKey && apiKey !== "INSERT_GEMINI_API_KEY_HERE";

        if (!isReady) {
            console.warn("Gemini API Key missing. Using CineMind Mock Intelligence.");
            return this.mockThink(prompt);
        }

        try {
            const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    system_instruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (err) {
            console.error("AI Service Error:", err);
            return "My cinematic circuits are slightly scrambled. Let's try again in a moment!";
        }
    },

    async getMovieRecommendations(userQuery, history = []) {
        const systemPrompt = `You are the CineSins AI Guru. You help users find movies based on their unique vibes. 
        Always respond in JSON format with an array of 3 movies. 
        Each movie object must have: title, year, reason (1 short sentence explaining why it fits the query).
        User's history: ${JSON.stringify(history.slice(-5))}. 
        Be sophisticated and premium in your tone.`;

        const responseText = await this.generateResponse(userQuery, systemPrompt);

        try {
            // Extract JSON if model wraps it in markdown blocks
            const jsonMatch = responseText.match(/\[.*\]/s) || responseText.match(/\{.*\}/s);
            return JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
        } catch (e) {
            console.error("Failed to parse AI JSON:", responseText);
            return null;
        }
    },

    async analyzeReviewSentiment(reviewText) {
        const prompt = `Analyze this movie review and return exactly two words: one emoji and one vibe name (e.g. "🔥 Masterpiece", "🎭 Emotional", "😴 Boring"). Review: "${reviewText}"`;
        return await this.generateResponse(prompt, "You are a sentiment analysis expert.");
    },

    // Mock Intelligence for when no API key is present
    async mockThink(prompt) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (prompt.toLowerCase().includes("recommend")) {
                    resolve(JSON.stringify([
                        { title: "Inception", year: "2010", reason: "Matches your interest in complex narrative structures." },
                        { title: "The Grand Budapest Hotel", year: "2014", reason: "Fits the aesthetic and vibing request perfectly." },
                        { title: "Blade Runner 2049", year: "2017", reason: "A visual masterpiece for a thoughtful viewer." }
                    ]));
                } else {
                    resolve("As an AI-powered engine, I recommend exploring films that challenge your perspective! (Add your Gemini API key in config.js to unlock my full potential)");
                }
            }, 1500);
        });
    }
};
