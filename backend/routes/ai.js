const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Helper to call Gemini securely
async function callGemini(prompt, systemInstruction = "") {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("INSERT")) {
        throw new Error("Gemini API key is missing or invalid");
    }

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, topP: 0.9, topK: 40, maxOutputTokens: 1024 }
    };

    if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const response = await axios.post(GEMINI_ENDPOINT, payload, {
        headers: { "Content-Type": "application/json" }
    });

    return response.data;
}

// Generate the interactive confessional quiz
router.get('/quiz', auth, async (req, res) => {
    try {
        const instruction = `Generate a 4-question interactive quiz....`; // Abridged instruction for length
        // In a real scenario, copy the huge prompt block from ai_service.js here.
        const prompt = "Generate a fresh confessional quiz returning exactly 4 questions in strict JSON format.";

        // Mocking the prompt content for brevity in the initial backend scaffold
        // The real implementation should move the exact string from ai_service.js
        const fullInstruction = `You are a cinematic mood analyzer. Generate exactly 4 unique, abstract questions. 
Respond ONLY with an array of 4 JSON objects. Example format:
[
  {
    "id": "q1",
    "topic": "The abstract scenario",
    "question": "What describes your mood?",
    "options": [
      { "id": "o1", "text": "Option 1", "genreFilter": ["Drama"] }
    ]
  }
]`;

        const rawRes = await callGemini(prompt, fullInstruction);
        const textToParse = rawRes.candidates[0].content.parts[0].text;

        // Clean markdown backticks if Gemini added them
        let cleaned = textToParse.replace(/```json/gi, '').replace(/```/g, '').trim();

        const quizData = JSON.parse(cleaned);
        res.json(quizData);
    } catch (err) {
        console.error("Gemini Error:", err.response?.data || err.message);
        res.status(500).json({ message: 'Error generating quiz', fallback: true });
    }
});

// Spotlight recommendations based on vibe text
router.post('/recommend', auth, async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ message: "Query required" });

        const prompt = `Based on this vibe: "${query}", recommend exactly 3 movies. Ensure strict JSON output...`;

        const instruction = `You are an elite film curator... Return ONLY a JSON array of 3 objects with titles and reasons.`;

        const rawRes = await callGemini(prompt, instruction);
        const textToParse = rawRes.candidates[0].content.parts[0].text;

        let cleaned = textToParse.replace(/```json/gi, '').replace(/```/g, '').trim();
        const recommendations = JSON.parse(cleaned);

        res.json({ recommendations });
    } catch (err) {
        res.status(500).json({ message: 'Error getting recommendations', error: err.message });
    }
});

module.exports = router;
