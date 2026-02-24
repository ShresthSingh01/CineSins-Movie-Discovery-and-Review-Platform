# AI Integration Plan: CineMind AI Engine

This document outlines the strategy for transforming CineSins from a rule-based platform into a truly AI-powered ecosystem using Large Language Models (LLMs) and intelligent analysis.

## Core Objectives
1.  **Conversational Discovery**: Move beyond dropdowns to natural language requests.
2.  **Semantic Reasoning**: Understand the "vibe" and "emotion" of a movie, not just its genre.
3.  **Behavioral Synthesis**: Use AI to explain user habits in the CinemaDNA dashboard.

## Phase 1: Infrastructure & "CineGuru" 🚀
*   **Integration**: Add Google Gemini 1.5 Flash support via a dedicated `ai_service.js`.
*   **The AI Guru**: A floating assistant that handles queries like *"Find me a movie that feels like a rainy Sunday in London."*
*   **Structured Output**: Use System Instructions to ensure the AI always returns JSON objects with movie metadata for instant rendering.

## Phase 2: Hyper-Personalized Decisions 🧠
*   **AI Insight Layer**: When the Decision Engine recommends a movie, the AI generates a unique "Why this movie?" blurb based on the user's current mood and history.
*   **Vibe-Matching**: Use LLM embeddings to find "hidden similarity" between movies (e.g., matching *The Matrix* with *The Trueman Show* because both explore "Simulated Reality").

## Phase 3: Smart Metadata & Sentiment ✍️
*   **Automatic Vibe-Tagging**: AI analyzes user reviews to extract hidden tags like `existential`, `vibrant-visuals`, or `slow-burn`.
*   **Narrative Summary**: The CinemaDNA dashboard gets a "Your Story" section—an AI-written summary of the user's unique taste.

## Technology Approach
*   **Gemini API**: Primary LLM for reasoning and chat.
*   **Client-Side NLP**: Lightweight sentiment analysis for instant feedback during review writing.
*   **Dynamic Prompting**: Context-aware prompts that feed the user's `store.js` history into the LLM for high-accuracy personalization.
