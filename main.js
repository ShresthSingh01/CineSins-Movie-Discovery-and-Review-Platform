import { ui } from './ui.js';
import { api } from './api.js';
import { decisionEngine } from './store.js';

window.addEventListener('DOMContentLoaded', () => {
    ui.init();

    // Expose api to the console for testing
    window.api = api;
    window.decisionEngine = decisionEngine;
    console.log("Modules loaded successfully! 🚀");

    if (window.location.port === '5500') {
        console.warn("⚠️ Running on Port 5500: Browsers often block module loading or have caching issues on this port. If movies don't load, please use port 8080 or a different server.");
    }

    window.debugCineSins = async () => {
        console.log("Clearing CineSins state...");
        localStorage.clear();
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
            await registration.unregister();
        }
        location.reload();
    };
    console.log("Tip: Run 'debugCineSins()' in the console to reset the app if experiencing persistent loading issues.");

    // Hero Section GSAP Animations
    const heroArea = document.getElementById('hero-area');
    const posters = document.querySelectorAll('.floating-poster');
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroSearch = document.querySelector('.hero-search');

    if (heroArea && typeof gsap !== 'undefined') {
        // 1. Entrance Reveal Animation
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(heroTitle,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1 })
            .fromTo(heroSubtitle,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8 }, "-=0.6")
            .fromTo(heroSearch,
                { y: 30, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 0.8 }, "-=0.5");

        // 2. Advanced Parallax Tracking
        if (posters.length > 0) {
            heroArea.addEventListener('mousemove', (e) => {
                const xPos = (e.clientX / window.innerWidth) - 0.5;
                const yPos = (e.clientY / window.innerHeight) - 0.5;

                posters.forEach((poster, index) => {
                    const depth = (index + 1) * 40;
                    gsap.to(poster, {
                        x: -(xPos * depth),
                        y: -(yPos * depth),
                        duration: 1,
                        ease: "power2.out"
                    });
                });
            });

            heroArea.addEventListener('mouseleave', () => {
                gsap.to(posters, { x: 0, y: 0, duration: 1.5, ease: "elastic.out(1, 0.5)" });
            });

            // 3. Ambient Floating Particles
            const particlesContainer = document.getElementById('particles-container');
            if (particlesContainer) {
                for (let i = 0; i < 30; i++) {
                    const particle = document.createElement('div');
                    particle.classList.add('particle');

                    // Randomize size and position
                    const size = Math.random() * 4 + 1; // 1px to 5px
                    particle.style.width = `${size}px`;
                    particle.style.height = `${size}px`;
                    particle.style.left = `${Math.random() * 100}%`;
                    particle.style.top = `${Math.random() * 100}%`;
                    particlesContainer.appendChild(particle);

                    // Animate with GSAP
                    gsap.to(particle, {
                        y: `-=${Math.random() * 100 + 50}`, // Move up 50-150px
                        x: `+=${Math.random() * 50 - 25}`, // Drift left/right
                        opacity: 0,
                        duration: Math.random() * 5 + 3, // 3-8 seconds
                        ease: "none",
                        repeat: -1,
                        yoyo: true,
                        delay: Math.random() * 5 // Random start times
                    });
                }
            }
        }
    }

    // Advanced UI Polish: Custom Ambient Cursor
    const cursorGlow = document.querySelector('.cursor-glow');
    if (cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            // Check if mobile device using window width
            if (window.innerWidth > 768) {
                // Instantly follow cursor (GSAP quickSetter is faster, but this works fine for CSS translation)
                requestAnimationFrame(() => {
                    cursorGlow.style.left = `${e.clientX}px`;
                    cursorGlow.style.top = `${e.clientY}px`;
                });
            }
        }, { passive: true });
    }

    // Global Ripple Effect for Buttons
    document.addEventListener('click', function (e) {
        const target = e.target.closest('button');
        if (target) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');

            const rect = target.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            target.appendChild(ripple);

            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });
        }
    });

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }

    // Offline Badge Logic
    const offlineBadge = document.getElementById('offline-badge');
    const updateOnlineStatus = () => {
        if (navigator.onLine) {
            offlineBadge.style.display = 'none';
        } else {
            offlineBadge.style.display = 'inline-block';
        }
    };
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // Install Prompt Logic
    let deferredPrompt;
    const installBtn = document.getElementById('install-btn');
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'inline-block';
    });

    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
            installBtn.style.display = 'none';
        }
    });

    // Unit test demonstrating it returns a normalized movie object array with explanations
    (async function runTest() {
        console.log("--- Running Decision Engine Unit Test ---");
        const recommendations = await decisionEngine({ mood: 'Comfort', time: 90, company: 'Alone' });
        console.log("Recommendations for {mood:'Comfort', time:90, company:'Alone'}:");
        recommendations.forEach((rec, i) => {
            console.log(`${i + 1}. ${rec.title} - ${rec.explain}`);
            console.log(rec);
        });
        console.log("--------------------------");

        console.log("--- Running computeMetrics Unit Test ---");
        const sampleMovie = { genres: "Drama, Romance", runtime: "120 min", imdbRating: "8.2" };
        const metrics = api.computeMetrics(sampleMovie);
        console.log(`Metrics for Genres: "Drama, Romance", Runtime: "120 min", imdbRating: "8.2":`);
        console.log(`Emotional Intensity: ${metrics.emotionalIntensity} (Expected >= 70)`);
        console.log(`Cognitive Load: ${metrics.cognitiveLoad}`);
        console.log(`Comfort Score: ${metrics.comfortScore}`);
        console.log("--------------------------");

        console.log("--- Running Scene Tags Unit Test ---");
        const { store } = await import('./store.js');
        const testMovieId = "tt1375666"; // Inception
        store.addTag(testMovieId, "dream");
        store.addTag(testMovieId, "heist");
        const tags = store.getTags(testMovieId);
        console.log(`Tags for ${testMovieId}:`, tags);
        const exported = store.exportTags();
        console.log("Exported JSON structure:", exported);
        console.log("Contains mapping for movie id?", exported.includes(`"${testMovieId}"`));
        console.log("--------------------------");

        console.log("--- Running Hidden Gems Unit Test ---");
        // Ensure cache is seeded
        if (store.getAllMovies().length < 50) {
            await store.seedMoviesIfNeeded();
        }
        const gems = store.getHiddenGems();
        console.log(`Top Hidden Gems extracted (${gems.length} elements):`);
        gems.slice(0, 3).forEach((g, i) => {
            console.log(`${i + 1}. ${g.title || g.Title} - Rating: ${g.imdbRating}, Votes: ${g.imdbVotes} -> HiddenScore: ${g.hiddenScore.toFixed(2)}`);
        });
        console.log("--------------------------");

        console.log("--- Running Compatibility Unit Test ---");
        const aMovies = [
            { id: "tt1", title: "Action1", genres: "Action, Sci-Fi", director: "Nolan", metrics: { emotionalIntensity: 80, cognitiveLoad: 70, comfortScore: 40 } },
            { id: "tt2", title: "Action2", genres: "Action", director: "Spielberg", metrics: { emotionalIntensity: 70, cognitiveLoad: 60, comfortScore: 50 } },
            { id: "tt3", title: "Comedy1", genres: "Comedy", director: "Waititi", metrics: { emotionalIntensity: 40, cognitiveLoad: 30, comfortScore: 90 } }
        ];
        const bMovies = [
            { id: "tt4", title: "Action3", genres: "Action, Adventure", director: "Nolan", metrics: { emotionalIntensity: 85, cognitiveLoad: 75, comfortScore: 35 } },
            { id: "tt5", title: "Comedy2", genres: "Comedy, Romance", director: "Meyers", metrics: { emotionalIntensity: 30, cognitiveLoad: 20, comfortScore: 85 } },
            { id: "tt6", title: "SciFi1", genres: "Sci-Fi", director: "Villeneuve", metrics: { emotionalIntensity: 75, cognitiveLoad: 80, comfortScore: 45 } }
        ];
        // They share genres: "Action", "Sci-Fi", "Comedy". Director: "Nolan". And metrics are close.
        const compat = store.computeCompatibility(aMovies, bMovies);
        console.log("Compatibility output:");
        console.log(`Score: ${compat.percentage}% (>50% expected for overlaps)`);
        console.log(`Shared Genres: ${compat.commonGenres.join(", ")}`);
        console.log(`Suggested movies returned: ${compat.suggestedMovies.length}`);
        console.log("--------------------------");

        console.log("--- Running CinemaDNA Unit Test ---");
        const dna = store.computeUserAnalytics();
        console.log("CinemaDNA Total Movies Evaluated:", dna.totalMoviesSaved);
        console.log("Favorite Genre:", dna.favoriteGenre);
        console.log("Average Runtime:", dna.avgRuntime);
        console.log("Mood Trend:", dna.moodTrend);
        console.log("Top Directors:", dna.top5Directors.join(', ') || "None");
        console.log("--------------------------");
    })();
});
