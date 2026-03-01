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

    /**
     * Generate a themed Confessional quiz — 4 unique questions with 4 options each.
     * Each option is designed to map to different movie genres/moods for AI filtering.
     */
    async generateConfessionalQuiz() {
        const systemPrompt = `You are CineMind, the darkly theatrical AI behind "The Confessional" — a cinematic personality quiz.
Generate EXACTLY 4 creative, themed questions to determine what movie someone should watch tonight.
Each question must be evocative, dramatic, and unique — NOT generic "what genre" questions.
Rules:
- Questions should be psychological, metaphorical, or scenario-based (e.g., "You find a locked door in an abandoned mansion...")
- Each question has exactly 4 answer options
- Each option should have an emoji and a short evocative label
- Respond ONLY with a JSON array. No markdown, no explanation.
Format: [{"question":"...","emoji":"🕯️","options":[{"emoji":"⚔️","label":"...","value":"action"},{"emoji":"💋","label":"...","value":"romance"},{"emoji":"🧠","label":"...","value":"cerebral"},{"emoji":"🌙","label":"...","value":"atmospheric"}]}]
The "value" field should be a lowercase genre/mood keyword like: action, romance, cerebral, atmospheric, dark, whimsical, epic, gritty, surreal, nostalgic, tense, cozy, chaotic, melancholy, rebellious, spiritual.`;

        try {
            const responseText = await this.generateResponse("Generate 4 unique confessional questions for tonight's movie.", systemPrompt);
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed) && parsed.length >= 3 && parsed[0].question) {
                    return parsed.slice(0, 4);
                }
            }
        } catch (e) {
            console.warn("Confessional quiz AI generation failed, using fallback");
        }

        // Fallback: rotating pre-built quiz sets
        return this._getRotatingQuizSet();
    },

    _getRotatingQuizSet() {
        const quizSets = [
            // Set 1: The Seven Sins
            [
                {
                    question: "You enter a forbidden room. What draws you in?", emoji: "🚪", options: [
                        { emoji: "⚔️", label: "A weapon rack glowing crimson", value: "action" },
                        { emoji: "💋", label: "A perfumed letter on silk sheets", value: "romance" },
                        { emoji: "💰", label: "A vault full of stolen gold", value: "heist" },
                        { emoji: "🐍", label: "Whispers from behind the walls", value: "thriller" }
                    ]
                },
                {
                    question: "Your shadow comes alive. It says:", emoji: "🌑", options: [
                        { emoji: "🧠", label: "\"You're not who you think you are\"", value: "cerebral" },
                        { emoji: "🔥", label: "\"Burn everything down\"", value: "chaotic" },
                        { emoji: "😢", label: "\"Remember what you lost\"", value: "melancholy" },
                        { emoji: "👑", label: "\"Take what's yours\"", value: "epic" }
                    ]
                },
                {
                    question: "What sin is etched on your tombstone?", emoji: "⚰️", options: [
                        { emoji: "🛋️", label: "Sloth — I never left the couch", value: "cozy" },
                        { emoji: "👁️", label: "Envy — I wanted their life", value: "dark" },
                        { emoji: "🍿", label: "Gluttony — I consumed everything", value: "epic" },
                        { emoji: "🎭", label: "Pride — I refused to break", value: "prestige" }
                    ]
                },
                {
                    question: "A stranger hands you a one-way ticket. Where?", emoji: "✈️", options: [
                        { emoji: "🏔️", label: "A snowy mountain monastery", value: "atmospheric" },
                        { emoji: "🌃", label: "A neon-lit underground city", value: "gritty" },
                        { emoji: "🏝️", label: "A cursed tropical island", value: "adventure" },
                        { emoji: "🌌", label: "A space station at the edge of time", value: "scifi" }
                    ]
                }
            ],
            // Set 2: Sensory
            [
                {
                    question: "Close your eyes. What do you hear?", emoji: "👂", options: [
                        { emoji: "🎻", label: "A melancholic violin in the rain", value: "melancholy" },
                        { emoji: "💥", label: "Explosions and shattering glass", value: "action" },
                        { emoji: "🌊", label: "Waves crashing against a cliffside", value: "atmospheric" },
                        { emoji: "🔔", label: "Church bells at midnight", value: "dark" }
                    ]
                },
                {
                    question: "A painting falls off the wall. Behind it is:", emoji: "🖼️", options: [
                        { emoji: "📜", label: "A map to buried treasure", value: "adventure" },
                        { emoji: "📷", label: "Photos of someone watching you", value: "thriller" },
                        { emoji: "💌", label: "A love letter from another century", value: "romance" },
                        { emoji: "🕳️", label: "A portal to another dimension", value: "scifi" }
                    ]
                },
                {
                    question: "The last meal before the world ends:", emoji: "🍽️", options: [
                        { emoji: "🥂", label: "Champagne in a candlelit tower", value: "prestige" },
                        { emoji: "🍕", label: "Pizza with best friends, laughing", value: "cozy" },
                        { emoji: "🥩", label: "A feast fit for a conquering king", value: "epic" },
                        { emoji: "☕", label: "Black coffee, alone, planning", value: "cerebral" }
                    ]
                },
                {
                    question: "You wake up with a superpower. You:", emoji: "⚡", options: [
                        { emoji: "🕐", label: "Rewind time to fix one mistake", value: "melancholy" },
                        { emoji: "🔍", label: "See through anyone's lies", value: "thriller" },
                        { emoji: "🌀", label: "Enter people's dreams", value: "surreal" },
                        { emoji: "💪", label: "Become indestructible", value: "action" }
                    ]
                }
            ],
            // Set 3: Cinematic Psychology
            [
                {
                    question: "Pick the director of your life movie:", emoji: "🎬", options: [
                        { emoji: "🎭", label: "Wes Anderson — symmetric whimsy", value: "whimsical" },
                        { emoji: "🔪", label: "David Fincher — calculated dread", value: "dark" },
                        { emoji: "🌸", label: "Greta Gerwig — warm honesty", value: "cozy" },
                        { emoji: "🌌", label: "Chris Nolan — mind-bending scale", value: "cerebral" }
                    ]
                },
                {
                    question: "Your villain archetype:", emoji: "😈", options: [
                        { emoji: "🃏", label: "The unpredictable chaos agent", value: "chaotic" },
                        { emoji: "🧊", label: "The cold, calculating mastermind", value: "thriller" },
                        { emoji: "💔", label: "The tragic fallen angel", value: "melancholy" },
                        { emoji: "👹", label: "The unstoppable force of nature", value: "action" }
                    ]
                },
                {
                    question: "Your movie's opening shot:", emoji: "📽️", options: [
                        { emoji: "🌅", label: "Dawn over an ancient kingdom", value: "epic" },
                        { emoji: "🌧️", label: "Rain on a neon-soaked alley", value: "gritty" },
                        { emoji: "🏡", label: "A cozy kitchen, morning light", value: "cozy" },
                        { emoji: "🔭", label: "A telescope pointing at infinity", value: "scifi" }
                    ]
                },
                {
                    question: "How does your story end?", emoji: "📖", options: [
                        { emoji: "🌄", label: "Walking into the sunset, redeemed", value: "nostalgic" },
                        { emoji: "🔥", label: "In a blaze of glory", value: "action" },
                        { emoji: "❓", label: "With a question the audience debates forever", value: "cerebral" },
                        { emoji: "💕", label: "In someone's arms, finally at peace", value: "romance" }
                    ]
                }
            ],
            // Set 4: The Dinner Party
            [
                {
                    question: "You host a dinner for 4 fictional characters. Who sits at the head?", emoji: "🪑", options: [
                        { emoji: "🧙", label: "Gandalf — wisdom and wonder", value: "epic" },
                        { emoji: "🕵️", label: "Sherlock Holmes — brilliant deduction", value: "cerebral" },
                        { emoji: "🦊", label: "The Fox from The Little Prince — tender philosophy", value: "whimsical" },
                        { emoji: "🗡️", label: "John Wick — silent intensity", value: "action" }
                    ]
                },
                {
                    question: "The music playing in the background:", emoji: "🎵", options: [
                        { emoji: "🎷", label: "Smoky jazz in a dim bar", value: "atmospheric" },
                        { emoji: "🎸", label: "Electric guitar, cranked to eleven", value: "chaotic" },
                        { emoji: "🎹", label: "A haunting piano melody", value: "melancholy" },
                        { emoji: "🎺", label: "An orchestral anthem swelling", value: "epic" }
                    ]
                },
                {
                    question: "A guest reveals a secret. Your reaction:", emoji: "🤫", options: [
                        { emoji: "😱", label: "\"I knew something was off!\"", value: "thriller" },
                        { emoji: "🤣", label: "\"That's hilarious, tell me more!\"", value: "cozy" },
                        { emoji: "😏", label: "\"I already knew. I always do.\"", value: "dark" },
                        { emoji: "🥺", label: "\"That must have been so hard...\"", value: "romance" }
                    ]
                },
                {
                    question: "Dessert. What arrives?", emoji: "🍰", options: [
                        { emoji: "🧁", label: "Cupcakes with nostalgic sprinkles", value: "nostalgic" },
                        { emoji: "🍫", label: "A decadent chocolate fortress", value: "prestige" },
                        { emoji: "🍦", label: "Something experimental — squid ink gelato", value: "surreal" },
                        { emoji: "🍎", label: "A poisoned apple. Someone screams.", value: "thriller" }
                    ]
                }
            ],
            // Set 5: Time Traveler
            [
                {
                    question: "You step into a time machine. First stop?", emoji: "⏳", options: [
                        { emoji: "🏛️", label: "Ancient Rome during the gladiator era", value: "action" },
                        { emoji: "🎩", label: "1920s jazz-age Paris", value: "atmospheric" },
                        { emoji: "🚀", label: "The year 3000", value: "scifi" },
                        { emoji: "🏴‍☠️", label: "The golden age of piracy", value: "adventure" }
                    ]
                },
                {
                    question: "You accidentally changed history. What happened?", emoji: "🕰️", options: [
                        { emoji: "💔", label: "Two soulmates never met", value: "romance" },
                        { emoji: "🌍", label: "A war was prevented — but at a cost", value: "cerebral" },
                        { emoji: "👻", label: "Something that shouldn't exist... exists", value: "dark" },
                        { emoji: "🎪", label: "Reality became beautifully absurd", value: "whimsical" }
                    ]
                },
                {
                    question: "A future newspaper headline about you:", emoji: "📰", options: [
                        { emoji: "🏆", label: "\"The Greatest Comeback in History\"", value: "epic" },
                        { emoji: "🔍", label: "\"The Mystery That Was Never Solved\"", value: "thriller" },
                        { emoji: "💡", label: "\"The Idea That Changed Everything\"", value: "cerebral" },
                        { emoji: "❤️", label: "\"A Love Story for the Ages\"", value: "romance" }
                    ]
                },
                {
                    question: "You return to the present. You're different now. How?", emoji: "🪞", options: [
                        { emoji: "🧊", label: "Colder, sharper, more calculated", value: "gritty" },
                        { emoji: "🌿", label: "Calmer, gentler, more at peace", value: "cozy" },
                        { emoji: "🔥", label: "Angrier, fiercer, ready to fight", value: "action" },
                        { emoji: "🌀", label: "Confused — is this reality even real?", value: "surreal" }
                    ]
                }
            ],
            // Set 6: Last Words
            [
                {
                    question: "The last text message you'd ever send:", emoji: "📱", options: [
                        { emoji: "💀", label: "\"I know your secret.\"", value: "thriller" },
                        { emoji: "❤️", label: "\"I should have said it sooner.\"", value: "romance" },
                        { emoji: "🗺️", label: "\"Follow the map I left you.\"", value: "adventure" },
                        { emoji: "😂", label: "\"Honestly? Worth it.\"", value: "cozy" }
                    ]
                },
                {
                    question: "You discover a hidden door in your house. Behind it:", emoji: "🚪", options: [
                        { emoji: "📚", label: "A library of books that write themselves", value: "surreal" },
                        { emoji: "🗡️", label: "An armory and a mission briefing", value: "action" },
                        { emoji: "🎭", label: "A mirror showing your alternate life", value: "melancholy" },
                        { emoji: "🌌", label: "A window to another planet", value: "scifi" }
                    ]
                },
                {
                    question: "Your spirit animal on a Friday night:", emoji: "🐾", options: [
                        { emoji: "🦉", label: "Owl — wise and observing from the shadows", value: "cerebral" },
                        { emoji: "🐺", label: "Wolf — hunting with the pack", value: "action" },
                        { emoji: "🦋", label: "Butterfly — drifting through beauty", value: "whimsical" },
                        { emoji: "🐈‍⬛", label: "Black cat — mysterious and unpredictable", value: "dark" }
                    ]
                },
                {
                    question: "The dream you keep having:", emoji: "💤", options: [
                        { emoji: "🏃", label: "Being chased through endless corridors", value: "thriller" },
                        { emoji: "🕊️", label: "Flying over a world you've never seen", value: "epic" },
                        { emoji: "🏠", label: "Being in a childhood home that's slightly... wrong", value: "atmospheric" },
                        { emoji: "💃", label: "Dancing with a stranger at a masquerade", value: "romance" }
                    ]
                }
            ]
        ];
        // Pick a random set
        return quizSets[Math.floor(Math.random() * quizSets.length)];
    },

    getFallbackRecommendations(query) {
        const q = query.toLowerCase();

        // Sin-based: Wrath (action, war, revenge, combat)
        if (q.includes("action") || q.includes("war") || q.includes("revenge") || q.includes("combat") || q.includes("wrath")) {
            const pool = [
                { title: "Mad Max: Fury Road", year: "2015", reason: "Pure vehicular fury — the wrath of the wasteland distilled into cinema." },
                { title: "John Wick", year: "2014", reason: "One man's righteous wrath, delivered with ballistic precision." },
                { title: "Gladiator", year: "2000", reason: "A fallen general's vengeance shakes the Roman Empire." },
                { title: "Kill Bill: Volume 1", year: "2003", reason: "The Bride's lethal wrath cuts through everything in her path." },
                { title: "The Raid", year: "2011", reason: "Relentless martial arts fury in a locked-down building." },
                { title: "Oldboy", year: "2003", reason: "Fifteen years of vengeance compressed into a devastating hammer." },
                { title: "Apocalypse Now", year: "1979", reason: "The horror of war and the madness it births." }
            ];
            return this._shufflePick(pool, 5);
        }

        // Sin-based: Lust (romance, passion, desire)
        if (q.includes("romance") || q.includes("passion") || q.includes("desire") || q.includes("love") || q.includes("lust")) {
            const pool = [
                { title: "In the Mood for Love", year: "2000", reason: "Unrequited desire simmers in every stolen glance." },
                { title: "Call Me by Your Name", year: "2017", reason: "A summer of intoxicating first love in Northern Italy." },
                { title: "Atonement", year: "2007", reason: "Passion torn apart by a devastating lie." },
                { title: "Blue Is the Warmest Color", year: "2013", reason: "Raw, consuming love explored with fearless intimacy." },
                { title: "Before Sunrise", year: "1995", reason: "Two strangers connect over one magical night in Vienna." },
                { title: "Portrait of a Lady on Fire", year: "2019", reason: "A forbidden gaze becomes an eternal love story." },
                { title: "Eternal Sunshine of the Spotless Mind", year: "2004", reason: "Love so deep you can't erase it even from memory." }
            ];
            return this._shufflePick(pool, 5);
        }

        // Sin-based: Sloth (comfort, feel-good, chill)
        if (q.includes("comfort") || q.includes("feel-good") || q.includes("chill") || q.includes("relax") || q.includes("sloth") || q.includes("gentle") || q.includes("soothing")) {
            const pool = [
                { title: "The Grand Budapest Hotel", year: "2014", reason: "Whimsical comfort food for the soul, served with style." },
                { title: "Amélie", year: "2001", reason: "A shy dreamer in Paris spreading joy — pure cinematic warmth." },
                { title: "Chef", year: "2014", reason: "A feel-good food journey that nourishes the spirit." },
                { title: "Paddington 2", year: "2017", reason: "The kindest movie ever made — a guaranteed mood lifter." },
                { title: "My Neighbor Totoro", year: "1988", reason: "Studio Ghibli's gentlest hug in animated form." },
                { title: "The Secret Life of Walter Mitty", year: "2013", reason: "A daydreamer's inspiring leap into adventure." },
                { title: "About Time", year: "2013", reason: "Time travel meets heartfelt family love — warm tears guaranteed." }
            ];
            return this._shufflePick(pool, 5);
        }

        // Sin-based: Pride (art-house, prestige, award-winning)
        if (q.includes("art") || q.includes("prestig") || q.includes("award") || q.includes("stunning") || q.includes("pride")) {
            const pool = [
                { title: "Moonlight", year: "2016", reason: "A luminous triptych of identity, told with breathtaking restraint." },
                { title: "The Tree of Life", year: "2011", reason: "Terrence Malick's most ambitious meditation on existence." },
                { title: "Roma", year: "2018", reason: "Cuarón's memory poem — every frame a master painting." },
                { title: "The Power of the Dog", year: "2021", reason: "Slow-burn prestige cinema with a devastating final twist." },
                { title: "Amour", year: "2012", reason: "Haneke's unflinching look at love's final chapter." },
                { title: "There Will Be Blood", year: "2007", reason: "Daniel Day-Lewis consumes the screen with volcanic pride." },
                { title: "Barry Lyndon", year: "1975", reason: "Kubrick's most visually pristine work — every frame a painting." }
            ];
            return this._shufflePick(pool, 5);
        }

        // Sin-based: Envy (thriller, mystery, suspense)
        if (q.includes("thriller") || q.includes("mystery") || q.includes("suspense") || q.includes("tension") || q.includes("envy") || q.includes("psychological")) {
            const pool = [
                { title: "Gone Girl", year: "2014", reason: "A marriage mystery that weaponizes envy into pure dread." },
                { title: "Se7en", year: "1995", reason: "Two detectives unravel a killer who punishes the seven deadly sins." },
                { title: "Zodiac", year: "2007", reason: "Obsessive pursuit of a killer who was never caught." },
                { title: "Prisoners", year: "2013", reason: "Moral lines blur as a father hunts his missing daughter." },
                { title: "Shutter Island", year: "2010", reason: "Nothing on this island is what it seems." },
                { title: "Nightcrawler", year: "2014", reason: "Jake Gyllenhaal channels dangerous ambition and voyeuristic envy." },
                { title: "Memories of Murder", year: "2003", reason: "Bong Joon-ho's haunting true-crime meditation on obsession." }
            ];
            return this._shufflePick(pool, 5);
        }

        // Sin-based: Gluttony (epic, fantasy, adventure, sci-fi, world-building)
        if (q.includes("epic") || q.includes("fantasy") || q.includes("adventure") || q.includes("sci-fi") || q.includes("world-building") || q.includes("gluttony")) {
            const pool = [
                { title: "Interstellar", year: "2014", reason: "An epic voyage through wormholes, love, and the fabric of time." },
                { title: "Dune", year: "2021", reason: "A mythic desert epic that demands to consume your senses." },
                { title: "The Lord of the Rings: The Fellowship of the Ring", year: "2001", reason: "The gold standard of fantasy world-building." },
                { title: "Blade Runner 2049", year: "2017", reason: "A gorgeous sci-fi meditation on what it means to be real." },
                { title: "Avatar: The Way of Water", year: "2022", reason: "Visual gluttony at its most breathtaking — pure feast." },
                { title: "Pan's Labyrinth", year: "2006", reason: "Dark fairy tale woven through Spanish Civil War horror." },
                { title: "Spirited Away", year: "2001", reason: "Miyazaki's most imaginative fantasy world — literal gluttony included." }
            ];
            return this._shufflePick(pool, 5);
        }

        // Sin-based: Greed (heist, crime, con-artist)
        if (q.includes("heist") || q.includes("crime") || q.includes("con-artist") || q.includes("underworld") || q.includes("greed")) {
            const pool = [
                { title: "The Departed", year: "2006", reason: "Rat-eat-rat in Scorsese's masterclass of criminal greed." },
                { title: "Ocean's Eleven", year: "2001", reason: "The most stylish heist ever assembled — greed never looked this good." },
                { title: "Heat", year: "1995", reason: "De Niro and Pacino orbit the same gravitational pull of greed." },
                { title: "The Wolf of Wall Street", year: "2013", reason: "Three hours of unchecked greed, excess, and Scorsese at his wildest." },
                { title: "Parasite", year: "2019", reason: "Class warfare as a con — greed devours everyone." },
                { title: "No Country for Old Men", year: "2007", reason: "A suitcase of money, an unstoppable killer, and zero mercy." },
                { title: "Catch Me If You Can", year: "2002", reason: "The world's most charming con-artist on a million-dollar spree." }
            ];
            return this._shufflePick(pool, 5);
        }

        // Generic fallback
        const pool = [
            { title: "Inception", year: "2010", reason: "A mind-bending journey through dream layers." },
            { title: "Parasite", year: "2019", reason: "A genre-defying masterpiece about class." },
            { title: "The Shawshank Redemption", year: "1994", reason: "A timeless story of hope and friendship." },
            { title: "Whiplash", year: "2014", reason: "An intense battle between ambition and mentorship." },
            { title: "Mad Max: Fury Road", year: "2015", reason: "Non-stop vehicular action in a dystopia." }
        ];
        return this._shufflePick(pool, 5);
    },

    // Shuffle and pick N items from an array for variety
    _shufflePick(arr, n) {
        const shuffled = [...arr].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, n);
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
                // Sentiment analysis takes priority (contains "analyze" + "review")
                if (p.includes("analyze") && p.includes("review")) {
                    const moods = ["🔥 Masterpiece", "🎭 Emotional", "💜 Captivating", "⚡ Thrilling", "🌟 Brilliant", "😢 Moving", "🎪 Wild Ride", "🧠 Thought-Provoking"];
                    resolve(moods[Math.floor(Math.random() * moods.length)]);
                } else if (p.includes("recommend") || p.includes("craving") || p.includes("find") || p.includes("suggest") || p.includes("[") || p.includes("json")) {
                    // Use sin-aware fallback for contextual, varied results
                    const picks = this.getFallbackRecommendations(prompt);
                    resolve(JSON.stringify(picks.slice(0, 3)));
                } else {
                    resolve("As an AI-powered engine, I recommend exploring films that challenge your perspective! (Add your Gemini API key in config.js to unlock my full potential)");
                }
            }, 800);
        });
    }
};
