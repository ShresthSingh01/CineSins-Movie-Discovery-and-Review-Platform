import { config } from '../config.js';

export const ttsService = {
    debounceTimer: null,
    activeUtterance: null,
    activeIcon: null,

    async playReview(text, rating, iconElement) {
        // Clear immediately if they move off fast
        this.stopSpeaking();

        // 500ms hover requirement to prevent spam
        this.debounceTimer = setTimeout(async () => {
            if (config.MURF_API_KEY && config.MURF_API_KEY !== "INSERT_MURF_API_KEY_HERE") {
                // Future Implementation: Proxy fetch to Cloudflare Worker -> Murf API
                console.log("Murf API Key detected. Engaging proxy call...");
                // this._playMurf(text, rating, iconElement);
            } else {
                // Default Free Mock: Web Speech API
                this._playMock(text, rating, iconElement);
            }
        }, 500);
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
    }
};

// Ensure voices are loaded ahead of time
if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
    };
}
