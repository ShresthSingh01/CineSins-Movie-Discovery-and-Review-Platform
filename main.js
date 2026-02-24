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

    // Global Ripple Effect for Buttons with Multi-click Protection
    document.addEventListener('click', function (e) {
        const target = e.target.closest('button, .search-btn, .save-btn');
        if (target && !target.disabled) {
            // Limit ripples to 3 per button to prevent visual clutter
            const existingRipples = target.querySelectorAll('.ripple');
            if (existingRipples.length > 3) {
                existingRipples[0].remove();
            }

            const ripple = document.createElement('span');
            ripple.classList.add('ripple');

            const rect = target.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.pointerEvents = 'none'; // Ensure ripple doesn't steal clicks

            target.appendChild(ripple);

            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });

            // Auto-remove fallback
            setTimeout(() => {
                if (ripple.parentElement) ripple.remove();
            }, 1000);
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

    // Startup checks complete 🚀
});
