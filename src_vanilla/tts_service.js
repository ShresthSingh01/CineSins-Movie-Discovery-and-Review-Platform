import { config } from '../config.js';

export const ttsService = {
    debounceTimer: null,
    activeUtterance: null,
    activeIcon: null,

    audioElement: null,

    async playReview(text, rating, iconElement) {
        // Clear immediately if they move off fast
        this.stopSpeaking();

        // 500ms hover requirement to prevent spam
        this.debounceTimer = setTimeout(async () => {
            if (config.MURF_API_KEY && config.MURF_API_KEY !== "INSERT_MURF_API_KEY_HERE") {
                // Execute Murf API Call 
                this._playMurf(text, rating, iconElement);
            } else {
                // Default Free Mock: Web Speech API
                this._playMock(text, rating, iconElement);
            }
        }, 500);
    },

    async playNarrator(text) {
        this.stopSpeaking();

        if (config.MURF_API_KEY && config.MURF_API_KEY !== "INSERT_MURF_API_KEY_HERE") {
            const safeKey = encodeURIComponent(text.slice(0, 30)).replace(/[^a-zA-Z0-9]/g, '_');
            const cacheKey = `murf_cache_narrator_${safeKey}`;
            let audioUrl = localStorage.getItem(cacheKey);

            if (!audioUrl) {
                try {
                    const response = await fetch("https://api.murf.ai/v1/speech/generate", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'api-key': config.MURF_API_KEY
                        },
                        body: JSON.stringify({
                            voiceId: "en-US-wayne", // Deep / Theatrical Male
                            style: "Narration",
                            text: text,
                            rate: -10,
                            pitch: -5,
                            format: "MP3"
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        audioUrl = data.audioFile;
                        localStorage.setItem(cacheKey, audioUrl);
                    } else {
                        console.error("Murf API Error (Narrator)");
                        return this._playMockNarrator(text);
                    }
                } catch (error) {
                    console.error("Murf Narrator Request Failed", error);
                    return this._playMockNarrator(text);
                }
            }

            this.audioElement = new Audio(audioUrl);

            this.audioElement.onended = () => {
                this.audioElement = null;
            };
            this.audioElement.onerror = () => {
                this.audioElement = null;
            };

            this.audioElement.play().catch(e => console.error("Narrator Playback Error: ", e));
        } else {
            this._playMockNarrator(text);
        }
    },

    stopSpeaking() {
        clearTimeout(this.debounceTimer);

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        if (this.activeIcon) {
            this.resetIcon(this.activeIcon);
        }

        this.activeUtterance = null;
        this.activeIcon = null;

        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            this.audioElement = null;
        }
    },

    animateIcon(iconElement) {
        if (!iconElement) return;
        iconElement.className = "fas fa-volume-up";
        // Give it a soundwave pulse look
        iconElement.style.color = "#c084fc";
        iconElement.style.transform = "scale(1.2)";
        iconElement.style.transition = "all 0.2s";

        // Use an interval to fake an equalizer bounce if CSS animation isn't defined
        let growing = true;
        iconElement.dataset.pulseInterval = setInterval(() => {
            iconElement.style.transform = growing ? "scale(1.3)" : "scale(1.1)";
            growing = !growing;
        }, 300);
    },

    resetIcon(iconElement) {
        if (!iconElement) return;

        if (iconElement.dataset.pulseInterval) {
            clearInterval(iconElement.dataset.pulseInterval);
            delete iconElement.dataset.pulseInterval;
        }

        iconElement.className = "fas fa-mask";
        iconElement.style.color = "rgba(255,255,255,0.8)";
        iconElement.style.transform = "scale(1)";
    },

    async _playMurf(text, rating, iconElement) {
        // 1. Check local cache to prevent burning API Quota
        // Use encodeURIComponent to prevent btoa from crashing on Emojis or smart quotes
        const safeKey = encodeURIComponent(text.slice(0, 30)).replace(/[^a-zA-Z0-9]/g, '_');
        const cacheKey = `murf_cache_${safeKey}`;
        let audioUrl = localStorage.getItem(cacheKey);

        if (!audioUrl) {
            this.animateIcon(iconElement); // Start animation while loading
            this.activeIcon = iconElement;

            // 2. Select Persona based on user star rating
            let voiceId = "en-US-marcus"; // Neutral/Default
            let style = "Conversational";
            let pitch = 0;
            let rate = 0;

            if (rating >= 4) {
                // Enthusiastic / Masterpiece
                voiceId = "en-US-cooper";
                style = "Promo";
                pitch = 5;
            } else if (rating <= 2) {
                // Disappointed / Critical
                voiceId = "en-US-wayne";
                style = "Sad";
                pitch = -5;
                rate = -10;
            }

            try {
                // Note: For production, this fetch should route through a serverless proxy
                // to completely hide the API key from the browser network tab.
                const response = await fetch("https://api.murf.ai/v1/speech/generate", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': config.MURF_API_KEY
                    },
                    body: JSON.stringify({
                        voiceId: voiceId,
                        style: style,
                        text: text,
                        rate: rate,
                        pitch: pitch,
                        format: "MP3"
                    })
                });

                if (!response.ok) {
                    console.error("Murf API Error", await response.text());
                    this.resetIcon(iconElement);
                    this.activeIcon = null;
                    return;
                }

                const data = await response.json();
                audioUrl = data.audioFile;

                // Save URL in cache (NOTE: Murf URLs may expire. If they do, cache Base64 instead via a proxy)
                localStorage.setItem(cacheKey, audioUrl);

            } catch (error) {
                console.error("Murf TTS Request Failed", error);
                this.resetIcon(iconElement);
                this.activeIcon = null;
                // Fallback to local
                return this._playMock(text, rating, iconElement);
            }
        }

        // 3. Play the Audio
        this.audioElement = new Audio(audioUrl);

        // Add subtle pitch shifting or reverb for that "Anonymous Community Echo" vibe
        // (If we were using the Web Audio API Context here, we could add reverb filters)

        this.audioElement.onplay = () => {
            this.activeIcon = iconElement;
            this.animateIcon(iconElement);
        };

        this.audioElement.onended = () => {
            this.resetIcon(iconElement);
            this.activeIcon = null;
            this.audioElement = null;
        };

        this.audioElement.onerror = () => {
            this.resetIcon(iconElement);
            this.activeIcon = null;
            this.audioElement = null;
        };

        this.audioElement.play().catch(e => console.error("Audio Playback Error: ", e));
    },

    _playMock(text, rating, iconElement) {
        if (!window.speechSynthesis) return;

        const utterance = new SpeechSynthesisUtterance(text);

        // Wait for voices to load (differs between browsers)
        let voices = window.speechSynthesis.getVoices();

        // Determine voice persona based on the star rating
        let selectedVoice = null;
        if (rating >= 4) {
            // Cheerful / prestige voice
            utterance.pitch = 1.2;
            utterance.rate = 1.05;
        } else if (rating <= 2) {
            // Critical / somber voice
            utterance.pitch = 0.8;
            utterance.rate = 0.95;
        } else {
            // Neutral
            utterance.pitch = 1.0;
            utterance.rate = 1.0;
        }

        // Try to find a good English voice
        if (voices.length > 0) {
            selectedVoice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB"));
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }

        utterance.onstart = () => {
            this.activeIcon = iconElement;
            this.animateIcon(iconElement);
        };

        utterance.onend = () => {
            this.resetIcon(iconElement);
            this.activeIcon = null;
            this.activeUtterance = null;
        };

        utterance.onerror = () => {
            this.resetIcon(iconElement);
            this.activeIcon = null;
            this.activeUtterance = null;
        };

        this.activeUtterance = utterance;

        // Ensure nothing else is speaking before we queue
        window.speechSynthesis.cancel();

        // Push speech to the background thread to avoid execution stalls
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);

            // Critical fix for Chrome Speech API bugs
            if (window.speechSynthesis.resume) {
                window.speechSynthesis.resume();
            }
        }, 50);
    },

    _playMockNarrator(text) {
        if (!window.speechSynthesis) return;

        const utterance = new SpeechSynthesisUtterance(text);

        // Deep voice logic
        utterance.pitch = 0.5;
        utterance.rate = 0.85;

        // Try to find a good English voice
        let voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            let selectedVoice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB"));
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }

        this.activeUtterance = utterance;

        window.speechSynthesis.cancel();
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
            if (window.speechSynthesis.resume) {
                window.speechSynthesis.resume();
            }
        }, 50);
    }
};

// Ensure voices are loaded ahead of time
if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}
