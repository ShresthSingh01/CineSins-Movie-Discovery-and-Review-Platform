import { api } from './api.js';
import { store } from './store.js';
import { config } from './config.js';
import { animations } from './ui/animations.js';

export const ui = {
    elements: {},
    state: {
        currentMovie: null,
        selectedRating: 0,
        renderedMoviesMaps: {}, // Using plural maps for all sections
        renderedGemsMap: {},
        renderedWatchlistMap: {}
    },

    getRegRiskBadgeHTML(movie) {
        if (!movie.regRisk) return '';
        const risk = movie.regRisk;
        return `
            <div class="regret-badge" 
                 style="background: ${risk.color};" 
                 title="Regret Risk: ${risk.reason}" 
                 aria-label="Regret Risk: ${risk.label}. ${risk.reason}">
                <i class="fas fa-exclamation-triangle"></i> ${risk.label} Risk
            </div>
        `;
    },

    applyFeatureFlags() {
        if (!config.FEATURES.sceneTags) {
            const tagsContainer = document.getElementById("modal-tags")?.parentElement;
            if (tagsContainer) tagsContainer.style.display = "none";
        }
        if (!config.FEATURES.watchNow) {
            const watchBtn = document.getElementById("watch-now-btn");
            if (watchBtn) watchBtn.style.display = "none";
        }
        if (!config.FEATURES.neonUI) {
            // Can toggle off particles or specific glowing classes if needed
            const particles = document.getElementById("particles-container");
            if (particles) particles.style.display = "none";
        }
        if (!config.FEATURES.sceneTags) {
            // Since sceneTags is false, we can also disable the carousel if that falls under it, or create a new flag.
            // The prompt said: "Disable/flag for later: Scene Carousel... { FEATURES: { sceneTags: false, watchNow: false, compatibility: false, neonUI: false } }"
            // Let's assume sceneTags flag covers carousel, or we add sceneCarousel to config.
            // Since config only mentioned 4 keys, let's just piggyback or hide carousel by default.
            const carousel = document.getElementById("modal-carousel");
            if (carousel) carousel.style.display = "none";
        }
        if (!config.FEATURES.compatibility) {
            const compatSection = document.getElementById("compatibility");
            if (compatSection) compatSection.style.display = "none";
        }
    },

    init() {
        this.initLoader();
        this.applyFeatureFlags();

        this.elements = {
            loaderWrapper: document.getElementById("loader-wrapper"),
            loaderBar: document.getElementById("loader-bar"),
            searchInput: document.getElementById("search-input"),
            searchBtn: document.getElementById("search-btn"),
            decisionBtn: document.getElementById("decision-mode-btn"),
            decisionModal: document.getElementById("decision-modal"),
            closeDecisionModal: document.getElementById("close-decision-modal"),
            decisionMood: document.getElementById("decision-mood"),
            decisionTime: document.getElementById("decision-time"),
            decisionCompany: document.getElementById("decision-company"),
            getRecommendationsBtn: document.getElementById("get-recommendations-btn"),
            decisionResults: document.getElementById("decision-results"),
            movieResults: document.getElementById("movie-results"),
            recentList: document.getElementById("recent-list"),
            reviewsList: document.getElementById("reviews-list"),
            watchlistList: document.getElementById("watchlist-list"),
            hiddenGemsResults: document.getElementById("hidden-gems-results"),
            cinemadnaList: document.getElementById("dna-directors"),
            headerSearchInput: document.getElementById("header-search-input"),
            dnaGenre: document.getElementById("dna-genre"),
            dnaRating: document.getElementById("dna-avg-rating"),
            dnaLogged: document.getElementById("dna-logged"),
            dnaChart: document.getElementById("dna-chart"),
            generateShareBtn: document.getElementById("generate-share-btn"),
            dnaShareCanvas: document.getElementById("dna-share-canvas"),
            modal: document.getElementById("review-modal"),
            closeModal: document.getElementById("close-modal"),
            modalTitle: document.getElementById("modal-title"),
            modalPoster: document.getElementById("modal-poster"),
            modalPlot: document.getElementById("modal-plot"),
            modalCarousel: document.getElementById("modal-carousel"),
            carouselTrack: document.getElementById("carousel-track"),
            carouselPrev: document.getElementById("carousel-prev"),
            carouselNext: document.getElementById("carousel-next"),
            carouselDots: document.getElementById("carousel-dots"),
            modalTags: document.getElementById("modal-tags"),
            newTagInput: document.getElementById("new-tag-input"),
            addTagBtn: document.getElementById("add-tag-btn"),
            starContainer: document.getElementById("star-container"),
            reviewText: document.getElementById("review-text"),
            charCount: document.getElementById("char-count"),
            saveBtn: document.getElementById("save-review"),
            watchlistBtn: document.getElementById("watchlist-btn"),
            watchNowBtn: document.getElementById("watch-now-btn"),
            importFile: document.getElementById("import-file"),
            decisionRegion: document.getElementById("decision-region"),
            regionsContainer: document.getElementById("regions-container"),
            zeroScrollModal: document.getElementById("zero-scroll-modal"),
            zeroScrollResults: document.getElementById("zero-scroll-results"),
            zeroScrollCTABtn: document.getElementById("zero-scroll-cta"),
            zeroScrollSpinBtn: document.getElementById("zero-scroll-spin-btn"),
            zeroScrollExitBtn: document.getElementById("zero-scroll-exit-btn"),
            tasteExportBtn: document.getElementById("export-taste-btn"),
            tasteCompareBtn: document.getElementById("compare-taste-btn"),
            tasteModal: document.getElementById("taste-modal"),
            closeTasteModal: document.getElementById("close-taste-modal"),
            tasteInputView: document.getElementById("taste-input-view"),
            tasteResultView: document.getElementById("taste-result-view"),
            friendTasteJson: document.getElementById("friend-taste-json"),
            runComparisonBtn: document.getElementById("run-comparison-btn"),
            backToTasteInputBtn: document.getElementById("back-to-input-btn"),
            similarityCircle: document.getElementById("similarity-circle"),
            compatibilityLabel: document.getElementById("compatibility-label"),
            sharedGenresList: document.getElementById("shared-genres-list"),
            divergentGenresList: document.getElementById("divergent-genres-list"),
            onboardingModal: document.getElementById("onboarding-modal"),
            startOnboardingBtn: document.getElementById("start-onboarding-btn"),
            onboardingIntro: document.getElementById("onboarding-step-intro"),
            onboardingQuiz: document.getElementById("onboarding-step-quiz"),
            onboardingResult: document.getElementById("onboarding-step-result"),
            quizQuestion: document.getElementById("quiz-question"),
            quizOptions: document.getElementById("quiz-options"),
            quizProgressText: document.getElementById("quiz-progress-text"),
            quizProgressBar: document.getElementById("quiz-progress-bar"),
            resultArchetypeLabel: document.getElementById("result-archetype-label"),
            resultArchetypeDesc: document.getElementById("result-archetype-desc"),
            seedDnaBtn: document.getElementById("seed-dna-btn"),
            finishOnboardingBtn: document.getElementById("finish-onboarding-btn"),
            decisionPrev: document.getElementById("decision-prev"),
            decisionNext: document.getElementById("decision-next"),
            dnaCardModal: document.getElementById("dna-card-modal"),
            dnaCardCloseBtn: document.getElementById("close-export-btn"),
            dnaCardDownloadBtn: document.getElementById("download-card-btn"),
            dnaCardExportTrigger: document.getElementById("export-taste-btn"),
            dnaRefreshBtn: document.getElementById("refresh-dna-btn")
        };

        this.setupNavigation();
        this.setupEventListeners();
        this.initHeaderScroll();
        this.initCursorGlow();

        // Initialize animations only after fonts are ready for accurate layout
        if (document.fonts) {
            document.fonts.ready.then(() => {
                this.initScrollAnimations();
                animations.init();
                ScrollTrigger.refresh();
            });
        } else {
            this.initScrollAnimations();
            animations.init();
        }

        this.loadRecent();
        this.initAISearch();
        this.initOnboarding();

        // Failsafe: Force complete loader after 6 seconds if it gets stuck
        setTimeout(() => this.completeLoader(), 6000);

        this.loadInitialMovies();
        this.loadCinemaDNA();
    },

    // A universal refresh to ensure GSAP/ScrollTrigger see new content
    refreshUI() {
        if (typeof ScrollTrigger !== 'undefined') {
            setTimeout(() => {
                ScrollTrigger.refresh();
                console.log("[UI] DOM synchronized with ScrollTrigger 🚀");
            }, 100);
        }
    },

    initLoader() {
        if (typeof gsap === 'undefined') return;

        const tl = gsap.timeline();

        // Rapid initial progress
        tl.to("#loader-bar", {
            width: "40%",
            duration: 0.3,
            ease: "power2.inOut"
        })
            .to("#loader-bar", {
                width: "80%",
                duration: 0.4,
                ease: "power1.inOut"
            });

        this.loaderTimeline = tl;
    },

    completeLoader() {
        if (!this.elements.loaderWrapper) return;
        if (this.state.loaderCompleted) return; // Prevent double completion
        this.state.loaderCompleted = true;

        if (typeof gsap !== 'undefined') {
            gsap.to("#loader-bar", {
                width: "100%",
                duration: 0.2,
                ease: "power2.out",
                onComplete: () => {
                    gsap.to(this.elements.loaderWrapper, {
                        opacity: 0,
                        duration: 0.4,
                        ease: "power2.inOut",
                        onComplete: () => {
                            this.elements.loaderWrapper.style.display = "none";
                            this.animateHeroEntrance();
                            this.refreshUI();
                        }
                    });
                }
            });
        } else {
            // Fallback for missing GSAP
            this.elements.loaderWrapper.classList.add('loaded');
            setTimeout(() => {
                this.elements.loaderWrapper.style.display = "none";
                document.body.style.overflow = "auto";
            }, 800);
        }
    },

    animateHeroEntrance() {
        if (typeof gsap === 'undefined') return;

        const tl = gsap.timeline();
        tl.from(".hero-title", {
            y: 60,
            opacity: 0,
            duration: 1,
            ease: "power4.out"
        })
            .from(".hero-subtitle", {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            }, "-=0.6")
            .from(".hero-search", {
                y: 30,
                opacity: 0,
                scale: 0.95,
                duration: 0.8,
                ease: "power3.out"
            }, "-=0.6")
            .set([".hero-title", ".hero-subtitle", ".hero-search"], { clearProps: "all", opacity: 1, visibility: "visible" });
    },

    initScrollAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        // Sections parallax/reveal
        document.querySelectorAll('.page-section').forEach(section => {
            // Aggressively exclude hero contents from general reveal to prevent GSAP collisions
            // We focus only on non-hero elements like section titles, general body text, and grids.
            const targets = section.querySelectorAll('.section-title, .container > p:not(.hero-subtitle), .movie-grid, .gems-grid, .dna-bento-grid, #regions-container, .dashboard-grid');
            const filteredTargets = Array.from(targets).filter(t => !t.closest('.hero-section'));

            if (filteredTargets.length === 0) return;

            gsap.from(filteredTargets, {
                scrollTrigger: {
                    trigger: section,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out",
                clearProps: "transform,opacity"
            });
        });

        // Hero Parallax
        gsap.to(".hero-content", {
            scrollTrigger: {
                trigger: ".hero-section",
                start: "top top",
                end: "bottom top",
                scrub: true
            },
            y: 200,
            opacity: 0
        });

        if (document.querySelector(".hero-gradient-overlay")) {
            gsap.to(".hero-gradient-overlay", {
                scrollTrigger: {
                    trigger: ".hero-section",
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                },
                opacity: 1
            });
        }
    },

    initHeaderScroll() {
        const header = document.getElementById('header');
        if (!header) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    },

    initCursorGlow() {
        const glow = document.getElementById('cursor-glow');
        if (!glow) return;

        window.addEventListener('mousemove', (e) => {
            gsap.to(glow, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.8,
                ease: "power2.out"
            });
        });

        // Add magnetic effect to specific elements
        document.querySelectorAll('.ripple-btn, .nav-btn, .logo').forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(glow, { scale: 2, backgroundColor: 'rgba(255, 46, 99, 0.4)', duration: 0.3 });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(glow, { scale: 1, backgroundColor: 'rgba(255, 46, 99, 0.15)', duration: 0.3 });
            });
        });
    },

    setupNavigation() {
        const mobileMenuBtn = document.getElementById("mobile-menu-btn");
        const mainNav = document.getElementById("main-nav");

        if (mobileMenuBtn && mainNav) {
            mobileMenuBtn.addEventListener("click", () => {
                mainNav.classList.toggle("active");
                mobileMenuBtn.innerHTML = mainNav.classList.contains("active")
                    ? '<i class="fas fa-times"></i>'
                    : '<i class="fas fa-bars"></i>';
            });
        }

        document.querySelectorAll("[data-section]").forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();
                const section = link.dataset.section;

                if (section === "decision-mode") {
                    this.elements.decisionModal.style.display = "flex";
                    setTimeout(() => this.elements.decisionModal.classList.add("active"), 10);
                    return;
                }

                // Close mobile menu
                if (mainNav) {
                    mainNav.classList.remove("active");
                    if (mobileMenuBtn) mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }

                document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
                const navLink = document.querySelector(`nav a[data-section="${section}"]`);
                if (navLink) navLink.classList.add("active");

                document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active"));
                const targetSec = document.getElementById(section);
                if (targetSec) targetSec.classList.add("active");

                if (section === 'reviews') this.loadUserReviews();
                if (section === 'watchlist') this.loadWatchlist();
                if (section === 'cinesins-dna') this.loadCinemaDNA();
                if (section === 'regions') this.loadRegions();
                if (section === 'hidden-gems') this.loadHiddenGems();

                // Refresh ScrollTrigger to account for newly visible sections
                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                }

                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    },

    setupEventListeners() {
        if (this.elements.searchBtn) {
            this.elements.searchBtn.onclick = () => this.searchMovies();
        }
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener("keypress", e => {
                if (e.key === "Enter") this.searchMovies();
            });
        }
        if (this.elements.headerSearchInput) {
            this.elements.headerSearchInput.addEventListener("keypress", e => {
                if (e.key === "Enter") {
                    this.elements.searchInput.value = this.elements.headerSearchInput.value;
                    this.searchMovies();
                }
            });
        }
        if (this.elements.reviewText) {
            this.elements.reviewText.oninput = () => {
                if (this.elements.charCount) {
                    this.elements.charCount.textContent = this.elements.reviewText.value.length + "/300";
                }
            };
        }
        if (this.elements.closeModal) {
            this.elements.closeModal.onclick = () => this.closeReviewModal();
        }
        if (this.elements.saveBtn) {
            this.elements.saveBtn.onclick = () => this.saveReview();
        }
        if (this.elements.watchlistBtn) {
            this.elements.watchlistBtn.onclick = () => this.toggleWatchlist();
        }

        // Scene Tags Events
        if (this.elements.addTagBtn) {
            this.elements.addTagBtn.onclick = () => this.addTagToCurrentMovie();
        }
        if (this.elements.newTagInput) {
            this.elements.newTagInput.addEventListener("keypress", e => {
                if (e.key === "Enter") this.addTagToCurrentMovie();
            });
        }

        if (this.elements.exportTagsBtn) {
            this.elements.exportTagsBtn.onclick = async (e) => {
                e.preventDefault();
                const { store } = await import('./store.js');
                const tagsJson = store.exportTags();
                const blob = new Blob([tagsJson], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `scene_tags_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            };
        }

        if (this.elements.importTagsBtn) {
            this.elements.importTagsBtn.onclick = (e) => {
                e.preventDefault();
                if (this.elements.importFile) this.elements.importFile.click();
            };
        }

        if (this.elements.importFile) {
            this.elements.importFile.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = async (event) => {
                    const { store } = await import('./store.js');
                    const success = store.importTags(event.target.result);
                    if (success) {
                        alert("Tags imported successfully!");
                        if (this.state.currentMovie) {
                            this.renderTags();
                        }
                    } else {
                        alert("Failed to import tags. Invalid JSON.");
                    }
                };
                reader.readAsText(file);
                e.target.value = ""; // Reset file input
            };
        }

        // Compatibility Mode Events
        if (this.elements.calcCompatBtn) {
            this.elements.calcCompatBtn.onclick = async () => {
                const inputsA = [
                    document.getElementById("pa-1").value.trim(),
                    document.getElementById("pa-2").value.trim(),
                    document.getElementById("pa-3").value.trim()
                ].filter(Boolean);

                const inputsB = [
                    document.getElementById("pb-1").value.trim(),
                    document.getElementById("pb-2").value.trim(),
                    document.getElementById("pb-3").value.trim()
                ].filter(Boolean);

                if (inputsA.length < 3 || inputsB.length < 3) {
                    alert("Please enter exactly 3 movies for both Person A and Person B.");
                    return;
                }

                this.elements.calcCompatBtn.textContent = "Computing...";
                this.elements.calcCompatBtn.disabled = true;

                try {
                    const fetchHelper = async (query) => {
                        if (query.toLowerCase().startsWith('tt')) {
                            return await api.fetchMovieById(query);
                        }
                        return await api.fetchMovieByTitle(query);
                    };

                    const moviesA = (await Promise.all(inputsA.map(fetchHelper))).filter(Boolean);
                    const moviesB = (await Promise.all(inputsB.map(fetchHelper))).filter(Boolean);

                    if (moviesA.length < 3 || moviesB.length < 3) {
                        alert("Some movies could not be found. Try checking titles or IDs.");
                        return;
                    }

                    const { store, computeCompatibility } = await import('./store.js');
                    if (store.getAllMovies().length < 50) {
                        await store.seedMoviesIfNeeded();
                    }

                    const storeCompatResult = computeCompatibility([...moviesA], [...moviesB]);

                    this.elements.compatScore.textContent = storeCompatResult.percentage;
                    this.elements.compatGenres.textContent = storeCompatResult.commonGenres.length ? storeCompatResult.commonGenres.join(', ') : "None";
                    this.elements.compatMoviesList.innerHTML = storeCompatResult.suggestedMovies.length ? "" : "<p>No suggestions found.</p>";

                    // Clear previous map for this container
                    this.state.renderedMoviesMaps[this.elements.compatMoviesList.id] = {};

                    storeCompatResult.suggestedMovies.forEach(m => {
                        const card = document.createElement("div");
                        card.className = "movie-card";
                        const fallback = "https://placehold.co/300x450/111/555?text=No+Poster";
                        const rawCover = (m.Poster && m.Poster !== "N/A") ? m.Poster : (m.poster && m.poster !== "N/A") ? m.poster : fallback;
                        const cover = this.getHighResPoster(rawCover);

                        const riskBadge = this.getRegRiskBadgeHTML(m);

                        card.innerHTML = `
                          ${riskBadge}
                          <img src="${cover}" alt="${m.title || m.Title}" onerror="this.src='${fallback}'">
                          <div class="card-overlay" style="z-index: 2;">
                            <div class="movie-info" style="pointer-events: none;">
                              <h3>${m.title || m.Title}</h3>
                              <p>${m.year || m.Year} • IMDb: ${m.imdbRating || "N/A"}</p>
                              <p class="plot-text" style="font-size: 0.85rem; margin-top: 5px; opacity: 0.8; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${m.plot || m.Plot || m.genres || "No description."}</p>
                              <p class="explain-string" style="color: #2ecc71; margin-top: 5px; font-weight: bold;">Perfect Joint Pick</p>
                              <button class="review-btn" data-action="open-modal" data-id="${m.imdbID || m.id}" style="pointer-events: auto; position: relative; z-index: 10;"><i class="fas fa-plus"></i> Watchlist / Review</button>
                            </div>
                          </div>`;

                        card.dataset.id = m.imdbID || m.id;
                        this.state.renderedMoviesMaps[this.elements.compatMoviesList.id][m.imdbID || m.id] = m;

                        card.querySelector(".review-btn").onclick = (e) => {
                            e.stopPropagation();
                            this.openModal(m, card.querySelector('img'));
                        };
                        this.elements.compatMoviesList.appendChild(card);
                    });

                    if (this.elements.generateCompatShareBtn) {
                        this.elements.generateCompatShareBtn.onclick = () => {
                            this.generateCompatShareCard(storeCompatResult);
                        };
                    }

                    this.elements.compatResults.style.display = "block";
                } catch (err) {
                    console.error(err);
                    alert("An error occurred computing compatibility.");
                } finally {
                    this.elements.calcCompatBtn.textContent = "Calculate Compatibility";
                    this.elements.calcCompatBtn.disabled = false;
                }
            };
        }

        if (this.elements.dnaRefreshBtn) {
            this.elements.dnaRefreshBtn.onclick = () => {
                this.elements.dnaRefreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
                this.loadCinemaDNA();
                setTimeout(() => {
                    this.elements.dnaRefreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh DNA';
                }, 1000);
            };
        }

        if (this.elements.generateShareBtn) {
            this.elements.generateShareBtn.onclick = () => this.openExportModal();
        }

        if (this.elements.dnaCardExportTrigger) {
            this.elements.dnaCardExportTrigger.onclick = () => this.openExportModal();
        }

        if (this.elements.dnaCardCloseBtn) {
            this.elements.dnaCardCloseBtn.onclick = () => {
                this.elements.dnaCardModal.classList.remove("active");
                setTimeout(() => this.elements.dnaCardModal.style.display = "none", 400);
            };
        }

        if (this.elements.dnaCardDownloadBtn) {
            this.elements.dnaCardDownloadBtn.onclick = async () => {
                const target = document.getElementById("dna-card-container");
                if (!target) return;

                const btn = this.elements.dnaCardDownloadBtn;
                const originalText = btn.innerHTML;

                try {
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating Image...';

                    // Ensure fonts are loaded
                    await document.fonts.ready;

                    const canvas = await html2canvas(target, {
                        backgroundColor: '#0a0a0c',
                        scale: 2, // Higher quality
                        useCORS: true,
                        logging: false,
                        onclone: (clonedDoc) => {
                            // Ensure the clones keep the correct layout
                            const clonedTarget = clonedDoc.querySelector("#dna-card-container");
                            if (clonedTarget) {
                                clonedTarget.style.transform = "none";
                                clonedTarget.style.opacity = "1";
                            }
                        }
                    });

                    const link = document.createElement('a');
                    link.download = `CineSins_DNA_${new Date().getTime()}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();

                    btn.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }, 2000);

                } catch (err) {
                    console.error("Download failed:", err);
                    alert("Could not generate image. Your browser might be blocking canvas operations.");
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            };
        }

        // Decision Mode Events
        if (this.elements.decisionBtn) {
            this.elements.decisionBtn.addEventListener('click', (e) => {
                if (e) e.preventDefault();
                this.elements.decisionModal.style.display = "flex";
                setTimeout(() => this.elements.decisionModal.classList.add("active"), 10);
                this.elements.decisionResults.innerHTML = "";
            });
        }
        if (this.elements.closeDecisionModal) {
            this.elements.closeDecisionModal.addEventListener('click', (e) => {
                if (e) e.preventDefault();
                this.elements.decisionModal.classList.remove("active");
                setTimeout(() => {
                    this.elements.decisionModal.style.display = "none";
                }, 400);
            });
        }

        // Spotlight Mode Toggle: Quick Filters vs Ask AI
        const filterTab = document.getElementById('spotlight-filter-tab');
        const aiTab = document.getElementById('spotlight-ai-tab');
        const filterSection = document.getElementById('spotlight-filter-section');
        const aiSection = document.getElementById('spotlight-ai-section');
        const filterBtn = document.getElementById('get-recommendations-btn');
        const aiBtn = document.getElementById('ai-spotlight-btn');

        if (filterTab && aiTab) {
            filterTab.onclick = () => {
                filterTab.style.background = '#6d28d9';
                filterTab.style.color = '#fff';
                aiTab.style.background = 'transparent';
                aiTab.style.color = 'rgba(255,255,255,0.5)';
                if (filterSection) filterSection.style.display = '';
                if (aiSection) aiSection.style.display = 'none';
                if (filterBtn) filterBtn.style.display = '';
                if (aiBtn) aiBtn.style.display = 'none';
            };
            aiTab.onclick = () => {
                aiTab.style.background = 'linear-gradient(135deg, #6d28d9, #db2777)';
                aiTab.style.color = '#fff';
                filterTab.style.background = 'transparent';
                filterTab.style.color = 'rgba(255,255,255,0.5)';
                if (filterSection) filterSection.style.display = 'none';
                if (aiSection) aiSection.style.display = '';
                if (filterBtn) filterBtn.style.display = 'none';
                if (aiBtn) aiBtn.style.display = '';
            };
        }

        // AI Spotlight Button Handler
        if (aiBtn) {
            aiBtn.onclick = async () => {
                await this.handleAISpotlight();
            };
        }
        if (this.elements.getRecommendationsBtn) {
            const updateRecs = async (e) => {
                if (e) e.preventDefault();
                if (this.state.isRecommending) return;
                this.state.isRecommending = true;

                const options = {
                    mood: this.elements.decisionMood.value,
                    time: parseInt(this.elements.decisionTime.value, 10),
                    company: this.elements.decisionCompany.value,
                    region: this.elements.decisionRegion.value
                };

                this.elements.decisionResults.innerHTML = '<div class="spinner" style="margin: 40px auto; grid-column: 1/-1;"></div>';

                try {
                    const { decisionEngine } = await import('./store.js');
                    const recommendations = await decisionEngine(options);

                    this.elements.decisionResults.innerHTML = "";
                    if (!recommendations || recommendations.length === 0) {
                        this.elements.decisionResults.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted); font-style: italic;">No exact matches found. Try relaxing your filters.</p>`;
                        return;
                    }

                    // Clear previous map for this container
                    this.state.renderedMoviesMaps[this.elements.decisionResults.id] = {};

                    recommendations.forEach(m => {
                        const fallback = "https://placehold.co/300x450/111/555?text=No+Poster";
                        const rawPoster = (m.Poster && m.Poster !== "N/A") ? m.Poster : (m.poster && m.poster !== "N/A") ? m.poster : fallback;
                        const posterUrl = this.getHighResPoster(rawPoster);

                        const badgeColor = m.dominantMetric === 'Intensity' ? 'var(--accent-secondary)' :
                            m.dominantMetric === 'Thought-Provoking' ? 'var(--accent-primary)' : 'var(--accent-tertiary)';

                        const metricBadgeHtml = m.metrics ?
                            `<span class="metric-badge" style="background: ${badgeColor};">
                                <i class="fas fa-chart-line"></i> ${m.dominantMetric} (${m.metrics[m.dominantMetric === 'Intensity' ? 'emotionalIntensity' : m.dominantMetric === 'Thought-Provoking' ? 'cognitiveLoad' : 'comfortScore']})
                            </span>` : '';

                        const riskBadgeHtml = this.getRegRiskBadgeHTML(m);

                        const card = document.createElement("div");
                        card.className = "movie-card decision-result-card";
                        card.innerHTML = `
                          ${riskBadgeHtml}
                          <img src="${posterUrl}" alt="${m.Title || m.title}" onerror="this.src='${fallback}'">
                          <div class="card-overlay active">
                            <div class="movie-info decision-info">
                                ${metricBadgeHtml}
                                <h3>${m.Title || m.title}</h3>
                                <p class="movie-meta">
                                    ${m.Year || m.year} • IMDb: ${m.imdbRating || "N/A"} • ${m.runtimeStr || m.runtime || "90 min"}
                                </p>
                                <p class="plot-text decision-plot">
                                    "${m.explain || 'Perfect match for your current vibes.'}"
                                </p>
                                <button class="review-btn btn-primary" data-action="open-modal" data-id="${m.imdbID || m.id}">
                                    <i class="fas fa-search"></i> View Discovery details
                                </button>
                            </div>
                          </div>`;

                        card.dataset.id = m.imdbID || m.id;
                        this.state.renderedMoviesMaps[this.elements.decisionResults.id][m.imdbID || m.id] = m;

                        card.onclick = async (e) => {
                            if (e.target.closest('.review-btn')) return;
                            await this.openModal(m, card.querySelector('img'));
                        };

                        const detailBtn = card.querySelector('.review-btn');
                        if (detailBtn) {
                            detailBtn.onclick = async (e) => {
                                e.stopPropagation();
                                await this.openModal(m, card.querySelector('img'));
                            };
                        }

                        this.elements.decisionResults.appendChild(card);
                    });
                } catch (err) {
                    console.error("Decision Mode Error:", err);
                    this.elements.decisionResults.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--accent-primary);">Something went wrong. Please try again.</p>`;
                } finally {
                    this.state.isRecommending = false;
                }
            };

            this.elements.getRecommendationsBtn.addEventListener('click', updateRecs);

            if (this.elements.decisionPrev) {
                this.elements.decisionPrev.onclick = () => {
                    this.elements.decisionResults.scrollBy({ left: -400, behavior: 'smooth' });
                };
            }
            if (this.elements.decisionNext) {
                this.elements.decisionNext.onclick = () => {
                    this.elements.decisionResults.scrollBy({ left: 400, behavior: 'smooth' });
                };
            }

            // Add automatic update when filters change
            ["decisionMood", "decisionTime", "decisionCompany", "decisionRegion"].forEach(id => {
                const el = this.elements[id] || document.getElementById(id);
                if (el) el.addEventListener('change', () => updateRecs());
            });
        }

        ["pa-1", "pa-2", "pa-3", "pb-1", "pb-2", "pb-3", "search-input"].forEach(id => {
            const el = document.getElementById(id);
            if (el) this.bindAutocomplete(el);
        });

        if (this.elements.zeroScrollCTABtn) {
            this.elements.zeroScrollCTABtn.onclick = () => this.openZeroScroll();
        }
        if (this.elements.zeroScrollSpinBtn) {
            this.elements.zeroScrollSpinBtn.onclick = () => this.spinZeroScroll();
        }
        if (this.elements.zeroScrollExitBtn) {
            this.elements.zeroScrollExitBtn.onclick = () => this.closeZeroScroll();
        }

        if (this.elements.tasteExportBtn) {
            this.elements.tasteExportBtn.onclick = () => this.handleTasteExport();
        }
        if (this.elements.tasteCompareBtn) {
            this.elements.tasteCompareBtn.onclick = () => {
                this.elements.tasteModal.style.display = "flex";
                this.elements.tasteInputView.style.display = "block";
                this.elements.tasteResultView.style.display = "none";
                this.elements.friendTasteJson.value = "";
                setTimeout(() => this.elements.tasteModal.classList.add("active"), 10);
            };
        }
        if (this.elements.closeTasteModal) {
            this.elements.closeTasteModal.onclick = () => {
                this.elements.tasteModal.classList.remove("active");
                setTimeout(() => this.elements.tasteModal.style.display = "none", 300);
            };
        }
        if (this.elements.runComparisonBtn) {
            this.elements.runComparisonBtn.onclick = () => this.handleTasteComparison();
        }
        if (this.elements.backToTasteInputBtn) {
            this.elements.backToTasteInputBtn.onclick = () => {
                this.elements.tasteInputView.style.display = "block";
                this.elements.tasteResultView.style.display = "none";
            };
        }

        window.onclick = e => {
            if (e.target === this.elements.modal) this.closeReviewModal();
            if (e.target === this.elements.tasteModal) {
                this.elements.tasteModal.classList.remove("active");
                setTimeout(() => this.elements.tasteModal.style.display = "none", 300);
            }
            if (e.target === this.elements.decisionModal) {
                this.elements.decisionModal.classList.remove("active");
                setTimeout(() => {
                    this.elements.decisionModal.style.display = "none";
                }, 400);
            }
        };
    },

    async handleAISpotlight() {
        const input = document.getElementById('spotlight-ai-input');
        const query = input ? input.value.trim() : '';
        if (!query) {
            alert('Please describe what kind of movie you\'re in the mood for!');
            return;
        }

        const resultsContainer = this.elements.decisionResults;
        if (!resultsContainer) return;

        // Show loading state
        resultsContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid rgba(139,92,246,0.2); border-top-color: #8b5cf6; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                <p style="color: #c4b5fd; margin-top: 20px; font-weight: 600; font-size: 1.1rem;">CineMind is analyzing your vibe...</p>
                <p style="color: rgba(255,255,255,0.4); font-size: 0.85rem; margin-top: 8px; font-style: italic;">"${query}"</p>
            </div>`;

        try {
            const { aiService } = await import('./ai_service.js');
            const aiPicks = await aiService.getSpotlightRecommendations(query);

            if (!aiPicks || aiPicks.length === 0) {
                resultsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">CineMind couldn't find matches for that vibe. Try rephrasing!</p>`;
                return;
            }

            // Fetch full movie details from TMDB/OMDB for each AI pick
            const movieFetches = aiPicks.map(async (rec) => {
                try {
                    const fetched = await api.fetchMovieByTitle(rec.title || rec.Title);
                    if (fetched) {
                        fetched._aiReason = rec.reason || '';
                        return fetched;
                    }
                } catch (e) { /* ignore */ }
                return null;
            });

            const fetchedMovies = (await Promise.all(movieFetches)).filter(Boolean);

            if (fetchedMovies.length === 0) {
                resultsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Could not fetch movie details. Please try again.</p>`;
                return;
            }

            const { store } = await import('./store.js');
            store.saveMoviesBatch(fetchedMovies);

            resultsContainer.innerHTML = '';

            // AI response banner
            const banner = document.createElement('div');
            banner.style.cssText = 'grid-column: 1/-1; margin-bottom: 16px; padding: 16px 24px; background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(219,39,119,0.08)); border: 1px solid rgba(139,92,246,0.2); border-radius: 14px; display: flex; align-items: center; gap: 12px;';
            banner.innerHTML = `<i class="fas fa-brain" style="color: #8b5cf6; font-size: 1.3rem;"></i><div><strong style="color: #fff;">CineMind Picks</strong><span style="color: var(--text-muted); margin-left: 8px; font-size: 0.9rem;">for: &quot;${query}&quot;</span></div>`;
            resultsContainer.appendChild(banner);

            // Clear previous map for this container
            if (!this.state.renderedMoviesMaps) this.state.renderedMoviesMaps = {};
            this.state.renderedMoviesMaps[resultsContainer.id] = {};

            fetchedMovies.forEach((m, i) => {
                const fallback = "https://placehold.co/300x450/111/555?text=No+Poster";
                const rawPoster = (m.Poster && m.Poster !== "N/A") ? m.Poster : (m.poster && m.poster !== "N/A") ? m.poster : fallback;
                const posterUrl = this.getHighResPoster(rawPoster);
                const reason = m._aiReason || aiPicks[i]?.reason || 'AI-curated for your vibe.';

                const riskBadge = this.getRegRiskBadgeHTML(m);

                const card = document.createElement("div");
                card.className = "movie-card decision-result-card";
                card.innerHTML = `
                    ${riskBadge}
                    <img src="${posterUrl}" alt="${m.Title || m.title}" onerror="this.src='${fallback}'">
                    <div class="card-overlay active">
                        <div class="movie-info decision-info">
                            <span style="display: inline-block; padding: 4px 10px; background: linear-gradient(135deg, rgba(139,92,246,0.3), rgba(219,39,119,0.2)); border-radius: 6px; font-size: 0.7rem; font-weight: 800; color: #c4b5fd; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                                <i class="fas fa-brain" style="margin-right: 4px;"></i> AI Pick #${i + 1}
                            </span>
                            <h3>${m.Title || m.title}</h3>
                            <p class="movie-meta">
                                ${m.Year || m.year} • IMDb: ${m.imdbRating || "N/A"} • ${m.Runtime || m.runtime || ""}
                            </p>
                            <p class="plot-text decision-plot" style="color: #c4b5fd; font-style: italic;">
                                "${reason}"
                            </p>
                            <button class="review-btn btn-primary" data-action="open-modal" data-id="${m.imdbID || m.id}">
                                <i class="fas fa-search"></i> View Details
                            </button>
                        </div>
                    </div>`;

                card.dataset.id = m.imdbID || m.id;
                this.state.renderedMoviesMaps[resultsContainer.id][m.imdbID || m.id] = m;

                card.onclick = async (e) => {
                    if (e.target.closest('.review-btn')) return;
                    await this.openModal(m, card.querySelector('img'));
                };

                const detailBtn = card.querySelector('.review-btn');
                if (detailBtn) {
                    detailBtn.onclick = async (e) => {
                        e.stopPropagation();
                        await this.openModal(m, card.querySelector('img'));
                    };
                }

                resultsContainer.appendChild(card);
            });

            this.refreshUI();
        } catch (err) {
            console.error("AI Spotlight Error:", err);
            resultsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--accent-primary);">Something went wrong. Please try again.</p>`;
        }
    },

    initAISearch() {
        const aiToggle = document.getElementById('ai-toggle-btn');
        const aiHint = document.getElementById('ai-search-hint');
        const normalTip = document.getElementById('normal-search-tip');
        if (!aiToggle) return;

        this.state.aiSearchActive = false;

        aiToggle.onclick = () => {
            this.state.aiSearchActive = !this.state.aiSearchActive;
            aiToggle.classList.toggle('active', this.state.aiSearchActive);

            if (this.state.aiSearchActive) {
                if (aiHint) aiHint.style.display = 'block';
                if (normalTip) normalTip.style.display = 'none';
                this.elements.searchInput.placeholder = 'Ask AI: "a mind-bending thriller like Inception"...';
                aiToggle.style.background = '#cc0000';
                aiToggle.style.color = '#fff';
            } else {
                if (aiHint) aiHint.style.display = 'none';
                if (normalTip) normalTip.style.display = 'block';
                this.elements.searchInput.placeholder = 'Search by title, genre, or scene...';
                aiToggle.style.background = '';
                aiToggle.style.color = '';
            }
        };
    },

    async aiSearch(query) {
        this.showSpinner();

        const { store } = await import('./store.js');
        store.saveRecentSearch(query);
        this.loadRecent();

        this.elements.movieResults.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><div style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#cc0000; animation: pulse-dot 1s infinite;"></div><p style="color: var(--text-light); margin-top: 16px; font-weight: 600;">CineMind AI is analyzing your request...</p><p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 8px;">' + query + '</p></div>';

        try {
            const { aiService } = await import('./ai_service.js');
            const recommendations = await aiService.getMovieRecommendations(query);

            if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
                this.elements.movieResults.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);"><i class="fas fa-robot" style="font-size: 2rem; margin-bottom: 10px; color: #cc0000;"></i><p>AI could not find matches. Try rephrasing!</p></div>';
                return;
            }

            // Try to fetch full details from OMDB/TMDB for each recommendation
            const movieFetches = recommendations.map(async (rec) => {
                try {
                    const fetched = await api.fetchMovieByTitle(rec.title || rec.Title);
                    if (fetched) {
                        fetched._aiReason = rec.reason || '';
                        return fetched;
                    }
                } catch (e) { /* ignore */ }
                return null;
            });

            const fetchedResults = await Promise.all(movieFetches);

            // Separate successful fetches from failed ones
            const fullMovies = [];
            const aiOnlyMovies = [];
            recommendations.forEach((rec, i) => {
                if (fetchedResults[i]) {
                    fullMovies.push(fetchedResults[i]);
                } else {
                    aiOnlyMovies.push(rec);
                }
            });

            this.elements.movieResults.innerHTML = '';

            // AI banner
            const banner = document.createElement('div');
            banner.style.cssText = 'grid-column: 1/-1; margin-bottom: 20px; padding: 16px 24px; background: hsla(0, 100%, 40%, 0.08); border: 1px solid hsla(0, 100%, 50%, 0.15); border-radius: 14px; display: flex; align-items: center; gap: 12px;';
            banner.innerHTML = '<i class="fas fa-brain" style="color: #cc0000; font-size: 1.3rem;"></i><div><strong style="color: #fff;">AI Discovery Results</strong><span style="color: var(--text-muted); margin-left: 8px;">for: &quot;' + query + '&quot;</span></div>';
            this.elements.movieResults.appendChild(banner);

            // Render fully-fetched movies with standard cards
            if (fullMovies.length > 0) {
                store.saveMoviesBatch(fullMovies);
                if (!this.state.renderedMoviesMaps) this.state.renderedMoviesMaps = {};
                this.state.renderedMoviesMaps['movie-results'] = this.state.renderedMoviesMaps['movie-results'] || {};
                fullMovies.forEach(m => {
                    const card = document.createElement('div');
                    card.className = 'movie-card';
                    const fallback = "https://placehold.co/300x450/111/555?text=No+Poster";
                    const rawPoster = (m.Poster && m.Poster !== "N/A") ? m.Poster : (m.poster && m.poster !== "N/A") ? m.poster : fallback;
                    const posterUrl = this.getHighResPoster(rawPoster);

                    const riskBadge = this.getRegRiskBadgeHTML(m);

                    card.innerHTML = riskBadge + '<img src="' + posterUrl + '" alt="' + (m.Title || m.title) + '" onerror="this.src=\'' + fallback + '\'">' +
                        '<div class="card-overlay"><div class="movie-info"><h3>' + (m.Title || m.title) + '</h3>' +
                        '<p class="movie-meta">' + (m.Year || m.year) + ' \u2022 IMDb: ' + (m.imdbRating || 'N/A') + '</p>' +
                        '<p class="plot-text">' + (m._aiReason || m.plot || m.Plot || 'No description.') + '</p>' +
                        '<button class="review-btn btn-primary" data-action="open-modal" data-id="' + (m.imdbID || m.id) + '"><i class="fas fa-plus"></i> View Details</button>' +
                        '</div></div>';
                    card.dataset.id = m.imdbID || m.id;
                    this.state.renderedMoviesMaps['movie-results'][m.imdbID || m.id] = m;
                    this.elements.movieResults.appendChild(card);
                });
            }

            // Render AI-only recommendations as special visible cards (no poster needed)
            if (aiOnlyMovies.length > 0) {
                aiOnlyMovies.forEach(rec => {
                    const card = document.createElement('div');
                    card.className = 'movie-card ai-result-card';
                    const title = rec.title || rec.Title || 'Unknown';
                    const year = rec.year || '';
                    const reason = rec.reason || 'AI-recommended movie.';
                    card.innerHTML = '<div class="ai-card-content">' +
                        '<div class="ai-card-icon"><i class="fas fa-film"></i></div>' +
                        '<h3>' + title + '</h3>' +
                        '<p class="movie-meta">' + year + '</p>' +
                        '<p class="ai-card-reason"><i class="fas fa-brain" style="color:#cc0000;margin-right:6px;"></i>' + reason + '</p>' +
                        '</div>';
                    this.elements.movieResults.appendChild(card);
                });
            }

            // Add click delegation for full movie cards
            this.elements.movieResults.onclick = (e) => {
                const btn = e.target.closest('.review-btn');
                const card = e.target.closest('.movie-card');
                if (btn && btn.dataset.action === "open-modal") {
                    const movieId = btn.dataset.id;
                    const movie = this.state.renderedMoviesMaps['movie-results']?.[movieId];
                    const posterImg = btn.closest('.movie-card').querySelector('img');
                    if (movie) this.openModal(movie, posterImg);
                } else if (card && !card.querySelector('.review-btn')) {
                    // AI-only card clicked: search for that specific movie
                    const titleEl = card.querySelector('h3');
                    if (titleEl) {
                        this.elements.searchInput.value = titleEl.textContent;
                        this.state.aiSearchActive = false;
                        const aiToggle = document.getElementById('ai-toggle-btn');
                        if (aiToggle) { aiToggle.style.background = ''; aiToggle.style.color = ''; aiToggle.classList.remove('active'); }
                        const aiHint = document.getElementById('ai-search-hint');
                        const normalTip = document.getElementById('normal-search-tip');
                        if (aiHint) aiHint.style.display = 'none';
                        if (normalTip) normalTip.style.display = 'block';
                        this.elements.searchInput.placeholder = 'Search by title, genre, or scene...';
                        this.searchMovies();
                    }
                }
            };
        } catch (err) {
            console.error("AI Search Error:", err);
            this.state.aiSearchActive = false;
            this.searchMovies();
        }
    },

    bindAutocomplete(inputNode) {
        let debounceTimer;
        const suggestionBox = document.createElement('div');
        suggestionBox.className = 'autocomplete-suggestions';
        inputNode.parentNode.insertBefore(suggestionBox, inputNode.nextSibling);

        inputNode.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const query = inputNode.value.trim();
            if (query.length < 3) {
                suggestionBox.style.display = 'none';
                return;
            }

            debounceTimer = setTimeout(async () => {
                const results = await api.searchMovies(query);
                if (results && results.length > 0) {
                    suggestionBox.innerHTML = '';
                    results.slice(0, 5).forEach(m => {
                        const div = document.createElement('div');
                        div.innerHTML = `<i class="fas fa-film" style="margin-right: 12px; color: var(--accent-primary); opacity: 0.7;"></i>` +
                            `<span style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${m.Title}</span>` +
                            `<span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 10px;">${m.Year}</span>`;
                        div.style.display = 'flex';
                        div.style.alignItems = 'center';
                        div.onclick = () => {
                            inputNode.value = m.Title;
                            suggestionBox.style.display = 'none';
                        };
                        suggestionBox.appendChild(div);
                    });
                    suggestionBox.style.display = 'block';
                } else {
                    suggestionBox.style.display = 'none';
                }
            }, 300);
        });

        document.addEventListener('click', (e) => {
            if (e.target !== inputNode && e.target !== suggestionBox) {
                suggestionBox.style.display = 'none';
            }
        });
    },

    async searchMovies() {
        const query = this.elements.searchInput.value.trim();
        if (!query) return;

        // Route to AI search if AI mode is active
        if (this.state.aiSearchActive) {
            return this.aiSearch(query);
        }

        this.showSpinner();

        const { store } = await import('./store.js');
        const { parseQueryToFilters } = await import('./src/semanticSearch.js');

        store.saveRecentSearch(query);
        this.loadRecent();

        const semanticFilters = await parseQueryToFilters(query);
        let results = [];
        const isTagSearch = query.toLowerCase().startsWith('scene:');

        if (isTagSearch) {
            const tagQuery = query.toLowerCase().replace('scene:', '').trim();
            const allMovies = store.getAllMovies();
            const allTags = store.getAllTags();
            results = allMovies.filter(m => {
                const mTags = allTags[m.id] || [];
                return mTags.some(t => t.includes(tagQuery));
            });
        } else {
            results = await api.searchMovies(query);

            // If normal search is sparse, try searching local store by genre/metrics if it's a semantic query
            if (results.length < 3 && semanticFilters) {
                const allLocal = store.getAllMovies();
                const semanticLocal = allLocal.filter(m => {
                    if (semanticFilters.preferGenres && semanticFilters.preferGenres.length > 0) {
                        const mGenres = (m.genres || "").toLowerCase();
                        return semanticFilters.preferGenres.some(g => mGenres.includes(g.toLowerCase()));
                    }
                    return false;
                });
                results = [...results, ...semanticLocal.slice(0, 10)];
            }
        }

        if (results && results.length > 0) {
            const detailedMovies = isTagSearch
                ? results
                : await Promise.all(results.map(m => api.fetchMovieById(m.imdbID || m.id)));

            let validDetailed = detailedMovies.filter(Boolean);

            // Apply Semantic Filter post-refinement
            if (semanticFilters && !isTagSearch && query.split(' ').length > 2) {
                validDetailed = validDetailed.filter(m => {
                    const metrics = m.metrics || { comfortScore: 50, emotionalIntensity: 50, cognitiveLoad: 50 };

                    if (semanticFilters.minComfort && metrics.comfortScore < (semanticFilters.minComfort * 100)) return false;
                    if (semanticFilters.minCognitive && metrics.cognitiveLoad < (semanticFilters.minCognitive * 100)) return false;
                    if (semanticFilters.maxCognitive && metrics.cognitiveLoad > (semanticFilters.maxCognitive * 100)) return false;
                    if (semanticFilters.minEmotional && metrics.emotionalIntensity < (semanticFilters.minEmotional * 100)) return false;

                    if (semanticFilters.maxRuntime) {
                        const mins = parseInt((m.runtime || "").match(/\d+/)?.[0] || "120");
                        if (mins > semanticFilters.maxRuntime + 10) return false;
                    }
                    return true;
                });

                // If filtering wiped out everything, keep originals but sort them by relevance
                if (validDetailed.length === 0) {
                    validDetailed = detailedMovies.filter(Boolean);
                }
            }

            if (!isTagSearch && validDetailed.length > 0) {
                store.saveMoviesBatch(validDetailed);
            }
            this.renderMovies(validDetailed, this.elements.movieResults);
        } else {
            this.elements.movieResults.innerHTML = "<p>No movies found. Try a broader search.</p>";
        }
    },

    // Helper to ensure high quality posters even for cached data
    getHighResPoster(url) {
        if (!url || url === "N/A" || url.includes("placehold.co")) return url;
        // TMDB: w500/w780 -> w1280
        if (url.includes("tmdb.org")) {
            return url.replace(/\/w\d+\//, "/w1280/");
        }
        // OMDB: SX300 -> SX1000
        if (url.includes("omdbapi.com")) return url.replace(/SX\d+/, 'SX1000');
        return url;
    },

    renderMovies(movies, container = null) {
        const target = container || this.elements.movieResults;
        if (!target) return;

        target.innerHTML = "";

        if (!movies || movies.length === 0) {
            target.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>No movies found matching your request.</p>
                </div>`;
            return;
        }

        const cards = [];
        // Consolidate into specific results map for this container to avoid clobbering
        const containerId = target.id || 'movie-results';
        if (!this.state.renderedMoviesMaps) this.state.renderedMoviesMaps = {};
        this.state.renderedMoviesMaps[containerId] = {};

        movies.forEach(m => {
            const card = document.createElement("div");
            card.className = "movie-card";
            const fallback = "https://placehold.co/300x450/111/555?text=No+Poster";
            const rawCover = (m.Poster && m.Poster !== "N/A") ? m.Poster : (m.poster && m.poster !== "N/A") ? m.poster : fallback;
            const cover = this.getHighResPoster(rawCover);

            const riskBadge = this.getRegRiskBadgeHTML(m);

            card.innerHTML = `
                ${riskBadge}
                <img src="${cover}" class="movie-card-img" alt="${m.Title || m.title}" onerror="this.src='${fallback}'">
                <div class="movie-card-overlay">
                    <div class="movie-card-info">
                        <h3 class="movie-card-title">${m.Title || m.title}</h3>
                        <div class="movie-card-meta">
                            <span>${m.Year || m.year}</span>
                            <span style="color: var(--cin-accent-2);">★ ${m.imdbRating || "N/A"}</span>
                        </div>
                        <button class="review-btn" data-action="open-modal" data-id="${m.imdbID || m.id}" 
                                style="margin-top: 12px; font-size: 0.7rem; padding: 6px 12px;">
                            <i class="fas fa-plus"></i> Watchlist / Review
                        </button>
                    </div>
                </div>`;

            card.dataset.id = m.imdbID || m.id;
            this.state.renderedMoviesMaps[containerId][m.imdbID || m.id] = m;

            target.appendChild(card);
            cards.push(card);
        });

        // Event Delegation Pattern
        target.onclick = (e) => {
            const btn = e.target.closest('.review-btn');
            const card = e.target.closest('.movie-card');

            if (btn && btn.dataset.action === "open-modal") {
                const movieId = btn.dataset.id;
                const movie = this.state.renderedMoviesMaps[containerId][movieId];
                const posterImg = btn.closest('.movie-card').querySelector('img');
                if (movie) this.openModal(movie, posterImg);
                return;
            }

            if (card) {
                const movieId = card.dataset.id;
                const movie = this.state.renderedMoviesMaps[containerId][movieId];
                const posterImg = card.querySelector('img');
                if (movie) this.openModal(movie, posterImg);
            }
        };

        // GSAP ScrollTrigger Batch Animation
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && cards.length > 0) {
            gsap.registerPlugin(ScrollTrigger);

            // Set initial state via GSAP instead of CSS to ensure they are visible if GSAP fails/triggers late
            gsap.set(cards, { opacity: 0, y: 30 });

            ScrollTrigger.batch(cards, {
                onEnter: batch => gsap.fromTo(batch,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.1,
                        duration: 0.6,
                        ease: "power2.out",
                        overwrite: true
                    }
                ),
                start: "top 95%",
            });
        }
        this.refreshUI();
    },

    async openModal(movie, sourceImgElement = null) {
        // Hydrate movie data if it's missing details (like actors or watch providers)
        // because initial batch load is now basic for speed.
        let detailedMovie = movie;
        if (!movie.actors || movie.actors === "N/A" || !movie.scenes || movie.scenes.length <= 1) {
            try {
                const refreshed = await api.fetchMovieById(movie.imdbID || movie.id);
                if (refreshed) detailedMovie = refreshed;
            } catch (e) {
                console.warn("Could not hydrate movie details, showing basic info:", e);
            }
        }

        this.state.currentMovie = detailedMovie;
        this.elements.modalTitle.textContent = detailedMovie.Title || detailedMovie.title;
        const fallback = "https://placehold.co/300x450/111/555?text=No+Poster";
        const rawPoster = (detailedMovie.Poster && detailedMovie.Poster !== "N/A") ? detailedMovie.Poster : (detailedMovie.poster && detailedMovie.poster !== "N/A") ? detailedMovie.poster : fallback;
        const posterUrl = this.getHighResPoster(rawPoster);
        this.elements.modalPoster.src = posterUrl;
        this.elements.modalPoster.onerror = function () { this.src = fallback; };

        this.elements.modalPlot.textContent = movie.plot || movie.Plot || "No plot summary available.";

        // Populate Cinemaholic specific details
        const modalYear = document.getElementById("modal-year");
        const modalRuntime = document.getElementById("modal-runtime");
        const modalRating = document.getElementById("modal-rating");
        const metricEmotional = document.getElementById("metric-emotional");
        const metricCognitive = document.getElementById("metric-cognitive");
        const metricComfort = document.getElementById("metric-comfort");

        if (modalYear) modalYear.textContent = detailedMovie.Year || detailedMovie.year || "";
        if (modalRuntime) modalRuntime.textContent = detailedMovie.Runtime || detailedMovie.runtime || "";
        if (modalRating) modalRating.textContent = `★ ${detailedMovie.imdbRating || "N/A"}`;

        // Calculate metrics based on genre if not present
        const metrics = detailedMovie.metrics || { emotionalIntensity: 50, cognitiveLoad: 50, comfortScore: 50 };
        if (!detailedMovie.metrics && detailedMovie.Genre) {
            // Simple heuristic for demo if metrics missing
            if (detailedMovie.Genre.includes("Drama")) metrics.emotionalIntensity = 80;
            if (detailedMovie.Genre.includes("Sci-Fi")) metrics.cognitiveLoad = 90;
            if (detailedMovie.Genre.includes("Comedy")) metrics.comfortScore = 85;
        }

        if (metricEmotional) metricEmotional.style.width = `${metrics.emotionalIntensity}%`;
        if (metricCognitive) metricCognitive.style.width = `${metrics.cognitiveLoad}%`;
        if (metricComfort) metricComfort.style.width = `${metrics.comfortScore}%`;

        this.setupCarousel(movie);

        const { store } = await import('./store.js');
        const saved = store.getReviews().find(r => r.id === (movie.imdbID || movie.id));
        this.state.selectedRating = saved ? saved.rating : 0;
        this.elements.reviewText.value = saved ? saved.text : "";
        if (this.elements.charCount && this.elements.reviewText) {
            this.elements.charCount.textContent = this.elements.reviewText.value.length + "/300";
        }

        // Update Watch Now link safely
        if (this.elements.watchNowBtn) {
            if (movie.watchLink) {
                this.elements.watchNowBtn.href = movie.watchLink;
            } else {
                const movieTitle = movie.Title || movie.title;
                this.elements.watchNowBtn.href = `https://www.google.com/search?q=where+to+watch+${encodeURIComponent(movieTitle)}+movie+online`;
            }
        }

        // Watchlist state
        const wl = store.getWatchlist().find(m => m.id === (movie.imdbID || movie.id));
        if (this.elements.watchlistBtn) {
            if (wl) {
                this.elements.watchlistBtn.innerHTML = '<i class="fas fa-check"></i> In Watchlist';
                this.elements.watchlistBtn.style.background = '#27ae60';
            } else {
                this.elements.watchlistBtn.innerHTML = '<i class="fas fa-bookmark"></i> Watchlist';
                this.elements.watchlistBtn.style.background = '#34495e';
            }
        }

        if (this.elements.newTagInput) this.elements.newTagInput.value = "";
        this.renderTags();
        this.renderStars();

        // Log the view event for Trends
        store.logMovieView(detailedMovie);

        this.elements.modal.style.display = "flex";
        setTimeout(() => {
            this.elements.modal.classList.add("active");
            animations.trapFocus(this.elements.modal);
        }, 10);
    },

    setupCarousel(movie) {
        const scenes = movie.scenes && movie.scenes.length > 0 ? movie.scenes : [];

        if (!this.elements.carouselTrack || !this.elements.carouselDots) {
            if (this.elements.modalCarousel) this.elements.modalCarousel.style.display = 'none';
            return;
        }

        this.elements.carouselTrack.innerHTML = '';
        this.elements.carouselDots.innerHTML = '';

        if (scenes.length === 0) {
            if (this.elements.modalCarousel) this.elements.modalCarousel.style.display = 'none';
            return;
        }

        this.elements.modalCarousel.style.display = 'block';

        scenes.forEach((url, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `<img src="${url}" alt="Scene ${index + 1}">`;
            this.elements.carouselTrack.appendChild(slide);

            const dot = document.createElement('div');
            dot.className = index === 0 ? 'carousel-dot active' : 'carousel-dot';
            dot.dataset.index = index;
            dot.addEventListener('click', () => this.goToSlide(index));
            this.elements.carouselDots.appendChild(dot);
        });

        this.state.currentSlide = 0;
        this.state.totalSlides = scenes.length;
        this.updateCarouselPosition();

        this.elements.carouselPrev.onclick = () => this.prevSlide();
        this.elements.carouselNext.onclick = () => this.nextSlide();
    },

    goToSlide(index) {
        this.state.currentSlide = index;
        this.updateCarouselPosition();
    },

    prevSlide() {
        this.state.currentSlide = (this.state.currentSlide - 1 + this.state.totalSlides) % this.state.totalSlides;
        this.updateCarouselPosition();
    },

    nextSlide() {
        this.state.currentSlide = (this.state.currentSlide + 1) % this.state.totalSlides;
        this.updateCarouselPosition();
    },

    updateCarouselPosition() {
        const offset = -this.state.currentSlide * 100;
        this.elements.carouselTrack.style.transform = `translateX(${offset}%)`;

        Array.from(this.elements.carouselDots.children).forEach((dot, index) => {
            dot.classList.toggle('active', index === this.state.currentSlide);
        });
    },

    async renderTags() {
        if (!this.state.currentMovie || !this.elements.modalTags) return;
        const { store } = await import('./store.js');
        const tags = store.getTags(this.state.currentMovie.imdbID || this.state.currentMovie.id);
        this.elements.modalTags.innerHTML = tags.length ? "" : "<p style='font-size:0.8rem;color:#777;'>No tags yet.</p>";
        tags.forEach(t => {
            const span = document.createElement('span');
            span.className = 'scene-tag';
            span.textContent = t;
            this.elements.modalTags.appendChild(span);
        });
    },

    async addTagToCurrentMovie() {
        if (!this.state.currentMovie) return;
        const tag = this.elements.newTagInput.value;
        if (!tag) return;
        const { store } = await import('./store.js');
        store.addTag(this.state.currentMovie.imdbID || this.state.currentMovie.id, tag);
        this.elements.newTagInput.value = "";
        this.renderTags();
    },

    closeReviewModal() {
        this.elements.modal.classList.remove("active");
        setTimeout(() => {
            this.elements.modal.style.display = "none";
        }, 400);
    },

    renderStars() {
        this.elements.starContainer.innerHTML = "";
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement("span");
            star.textContent = "★";
            star.className = i <= this.state.selectedRating ? "star active" : "star";
            star.style.cursor = "pointer";
            star.style.transition = "color 0.2s, transform 0.2s";

            star.onclick = (e) => {
                e.stopPropagation();
                this.state.selectedRating = i;
                this.renderStars();
            };

            star.onmouseenter = () => {
                const allStars = this.elements.starContainer.querySelectorAll('.star');
                allStars.forEach((s, idx) => {
                    if (idx < i) s.classList.add('hover');
                    else s.classList.remove('hover');
                });
            };

            star.onmouseleave = () => {
                const allStars = this.elements.starContainer.querySelectorAll('.star');
                allStars.forEach(s => s.classList.remove('hover'));
            };

            this.elements.starContainer.appendChild(star);
        }
    },

    async saveReview() {
        if (!this.state.currentMovie || this.state.isSaving) return;
        this.state.isSaving = true;

        try {
            let aiSentiment = null;
            if (this.elements.reviewText.value.length > 5) {
                try {
                    const { aiService } = await import('./ai_service.js');
                    aiSentiment = await aiService.analyzeReviewSentiment(this.elements.reviewText.value);
                } catch (e) {
                    console.warn("AI Sentiment failed, ignoring.");
                }
            }

            const newReview = {
                id: this.state.currentMovie.imdbID || this.state.currentMovie.id,
                title: this.state.currentMovie.Title || this.state.currentMovie.title,
                poster: this.state.currentMovie.Poster || this.state.currentMovie.poster,
                rating: this.state.selectedRating,
                text: this.elements.reviewText.value,
                aiMood: aiSentiment,
                date: new Date().toLocaleDateString()
            };
            const { store } = await import('./store.js');
            store.saveReview(newReview);
            store.saveMoviesBatch([this.state.currentMovie]);

            this.closeReviewModal();
            if (document.getElementById("reviews").classList.contains("active")) {
                this.loadUserReviews();
            }
            if (document.getElementById("cinesins-dna").classList.contains("active")) {
                this.loadCinemaDNA();
            }
            // Always refresh stats in state regardless of active view
            this.loadCinemaDNA();
        } finally {
            this.state.isSaving = false;
        }
    },

    async toggleWatchlist() {
        if (!this.state.currentMovie) return;
        const { store } = await import('./store.js');
        const added = store.toggleWatchlist({
            id: this.state.currentMovie.imdbID || this.state.currentMovie.id,
            title: this.state.currentMovie.Title || this.state.currentMovie.title,
            poster: this.state.currentMovie.Poster || this.state.currentMovie.poster,
            year: this.state.currentMovie.Year || this.state.currentMovie.year
        });

        if (added) {
            this.elements.watchlistBtn.innerHTML = '<i class="fas fa-check"></i> In Watchlist';
            this.elements.watchlistBtn.style.background = '#27ae60';
        } else {
            this.elements.watchlistBtn.innerHTML = '<i class="fas fa-bookmark"></i> Watchlist';
            this.elements.watchlistBtn.style.background = '#34495e';
        }
    },

    loadUserReviews() {
        if (!this.elements.reviewsList) return;
        const reviews = store.getReviews();

        if (!reviews.length) {
            this.elements.reviewsList.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; opacity: 0.5;">
                    <i class="fas fa-film" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <p style="font-size: 1.2rem; font-weight: 500;">No reviews yet.</p>
                    <p style="color: var(--text-muted);">Start your journey by reviewing a movie!</p>
                </div>`;
            return;
        }

        this.elements.reviewsList.innerHTML = "";

        const spoilerTokens = ['ending', 'twist is', 'spoiler', 'dies', 'the killer is'];

        reviews.forEach(r => {
            // Data Validation: Skip invalid or legacy records
            if (!r || typeof r !== 'object' || !r.id) return;

            const div = document.createElement("div");
            div.className = "review-card premium-card";

            let reviewHtml = "";
            let expandHtml = "";

            const text = r.text || "";
            // Keep clamping logic simple via CSS, but add "Read More" button if text is long
            const isLong = text.length > 150;

            const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || [text];
            const spoilerIndex = sentences.findIndex(s => spoilerTokens.some(token => s.toLowerCase().includes(token)));
            const hasSpoiler = spoilerIndex !== -1;

            if (hasSpoiler) {
                const splitAt = Math.min(2, Math.max(0, spoilerIndex));
                const safePart = splitAt > 0 ? sentences.slice(0, splitAt).join("").trim() : "<i style='color:#e74c3c'>[Spoiler Warning]</i>";
                const spoilerPart = sentences.slice(splitAt).join("").trim();

                reviewHtml = `
                <div class="spoiler-container">
                  <p class="safe-text">${safePart}</p>
                  ${spoilerPart ? `
                  <div class="spoiler-content collapsed-review">
                    <p class="review-body">${spoilerPart}</p>
                  </div>
                  <button class="spoiler-btn ripple-btn"><i class="fas fa-eye-slash"></i> Reveal Spoiler</button>
                  ` : ''}
                </div>`;
            } else {
                reviewHtml = `
                <div class="review-text-container ${isLong ? 'has-overflow' : ''}">
                    <p class="review-body ${isLong ? 'clamped' : ''}">${text}</p>
                    ${isLong ? '<button class="read-more-btn">Read More</button>' : ''}
                </div>`;
            }

            // Generate animated star string
            const fullStars = "★".repeat(r.rating);
            const emptyStars = "☆".repeat(5 - r.rating);
            let starsHtml = `<span class="stars-fill">${fullStars}</span><span class="stars-empty">${emptyStars}</span>`;

            // Dynamic Avatar Mapping based on rating
            let expression = "";
            if (r.rating >= 4) {
                // Happy mood
                expression = "&mouth=smile&eyes=default&eyebrows=raisedExcited";
            } else if (r.rating >= 2) {
                // Neutral mood
                expression = "&mouth=serious&eyes=default&eyebrows=default";
            } else {
                // Sad mood
                expression = "&mouth=sad&eyes=cry&eyebrows=sadConcerned";
            }

            const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${r.id}${expression}`;

            const aiMoodHtml = r.aiMood ? `<span class="ai-tag-inline" title="AI Insight"><i class="fas fa-brain"></i> ${r.aiMood}</span>` : "";

            div.innerHTML = `
            <div class="review-header">
                <img src="${avatarUrl}" alt="Avatar" class="user-avatar">
                <div class="user-info">
                    <h3 style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                        ${r.title}
                        ${aiMoodHtml}
                    </h3>
                    <span class="review-meta">${r.date} • <span class="review-stars">${starsHtml}</span></span>
                </div>
            </div>
            <div class="review-content">
                ${reviewHtml}
            </div>
            <div class="review-actions">
                <button class="edit btn-action"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete btn-action btn-danger"><i class="fas fa-trash"></i> Delete Review</button>
            </div>`;
            div.querySelector(".edit").onclick = async () => {
                const movie = await api.fetchMovieById(r.id);
                if (movie) this.openModal(movie);
            };
            div.querySelector(".delete").onclick = () => {
                store.removeReview(r.id);
                this.loadUserReviews();
                this.loadCinemaDNA();
            };
            this.elements.reviewsList.appendChild(div);
        });

        // GSAP Staggered Entry for Review Cards
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && reviews.length > 0) {
            const premiumCards = document.querySelectorAll('#reviews .premium-card');
            // Ensure they are visible if GSAP fails/delays
            gsap.set(premiumCards, { opacity: 1, y: 0 });

            gsap.from(premiumCards, {
                opacity: 0,
                y: 30,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "#reviews",
                    start: "top 80%",
                    once: true
                }
            });
        }
        this.refreshUI();
    },

    async loadRecent() {
        const { store } = await import('./store.js');
        const list = store.getRecentSearches();
        if (!this.elements.recentList) return;
        this.elements.recentList.innerHTML = "";
        list.forEach(q => {
            const li = document.createElement("li");
            li.textContent = q;
            li.onclick = () => {
                this.elements.searchInput.value = q;
                this.searchMovies();
            };
            this.elements.recentList.appendChild(li);
        });
    },



    async loadCinemaDNA() {
        console.log("[DNA] Loading Cinematic Soul...");
        try {
            const analytics = await store.computeUserAnalytics();
            this.state.latestDNA = analytics;

            // Brutal direct DOM selection for maximum reliability
            const el = {
                genre: document.getElementById("dna-genre"),
                rating: document.getElementById("dna-avg-rating"),
                logged: document.getElementById("dna-logged"),
                directors: document.getElementById("dna-directors"),
                archetypeTitle: document.getElementById("archetype-label"),
                archetypeDesc: document.getElementById("archetype-description"),
                archetypeIcon: document.getElementById("archetype-icon-wrapper"),
                archetypeCont: document.getElementById("archetype-container")
            };

            if (!analytics || analytics.totalReviews === 0) {
                console.warn("[DNA] No analytics found or 0 reviews. Dashboard staying in idle state.");
                if (el.genre) el.genre.textContent = "-";
                if (el.rating) el.rating.textContent = "0.0";
                if (el.logged) el.logged.textContent = "0";
                if (el.directors) el.directors.innerHTML = "<li style='opacity:0.6; font-style:italic;'>No reviews logged yet.</li>";
                if (el.archetypeCont) el.archetypeCont.style.opacity = "0.3";
                this.drawDNAChart({});
                return;
            }

            console.log("[DNA] Data found:", analytics);

            if (el.archetypeCont) el.archetypeCont.style.opacity = "1";
            if (el.genre) el.genre.textContent = analytics.favoriteGenre || "N/A";
            if (el.rating) el.rating.textContent = analytics.avgRating || "0.0";
            if (el.logged) el.logged.textContent = analytics.totalReviews || "0";

            if (el.directors) {
                el.directors.innerHTML = "";
                if (analytics.top5Directors && analytics.top5Directors.length > 0) {
                    analytics.top5Directors.forEach(d => {
                        const li = document.createElement("li");
                        li.className = "dna-pill";
                        li.textContent = d;
                        el.directors.appendChild(li);
                    });
                } else {
                    el.directors.innerHTML = "<li class='dna-pill' style='opacity:0.6; font-style:italic;'>Log more to see directors</li>";
                }
            }

            this.drawDNAChart(analytics.genreCounts || {});

            if (analytics.archetype) {
                this.renderArchetypeCard(analytics.archetype);
            } else {
                if (el.archetypeTitle) el.archetypeTitle.textContent = "Developing Persona...";
                if (el.archetypeDesc) el.archetypeDesc.textContent = "Keep logging reviews to unlock your unique cinematic archetype.";
            }

            // Load Trends
            this.loadTrends();

        } catch (err) {
            console.error("[DNA] CRITICAL FAILURE:", err);
            const dnaRating = document.getElementById("dna-avg-rating");
            const dnaLogged = document.getElementById("dna-logged");
            if (dnaRating) dnaRating.textContent = "ERROR";
            if (dnaLogged) dnaLogged.textContent = "!";
        }
    },

    async handleTasteExport() {
        try {
            const { exportTasteCard } = await import('./src/tasteGraph.js');
            const { store } = await import('./store.js');
            const analytics = await store.computeUserAnalytics();

            if (!analytics || analytics.totalReviews === 0) {
                alert("Log at least one movie review to generate your Taste Card!");
                return;
            }

            const card = exportTasteCard(analytics);
            const json = JSON.stringify(card);

            await navigator.clipboard.writeText(json);
            alert("Your anonymous Taste Card has been copied to clipboard! Share it with a friend.");
        } catch (e) {
            console.error("Export failed:", e);
            alert("Failed to export Taste Card.");
        }
    },

    async handleTasteComparison() {
        const rawJson = this.elements.friendTasteJson.value.trim();
        if (!rawJson) {
            alert("Please paste a friend's Taste Card JSON.");
            return;
        }

        try {
            const friendCard = JSON.parse(rawJson);
            const { compareTasteCards, exportTasteCard } = await import('./src/tasteGraph.js');
            const { store } = await import('./store.js');
            const myAnalytics = await store.computeUserAnalytics();
            const myCard = exportTasteCard(myAnalytics);

            const result = compareTasteCards(myCard, friendCard);

            // Update UI
            this.elements.tasteInputView.style.display = "none";
            this.elements.tasteResultView.style.display = "block";

            // Animate similarity score
            let count = 0;
            const target = result.score;
            const circle = this.elements.similarityCircle;
            const label = this.elements.compatibilityLabel;

            const interval = setInterval(() => {
                if (count >= target) {
                    clearInterval(interval);
                    circle.textContent = `${target}%`;
                } else {
                    count++;
                    circle.textContent = `${count}%`;
                }
            }, 15);

            if (target > 85) label.textContent = "Cinematic Soulmates";
            else if (target > 65) label.textContent = "High Compatibility";
            else if (target > 40) label.textContent = "Balanced Duo";
            else label.textContent = "Opposites Attract";

            // Lists
            this.elements.sharedGenresList.innerHTML = result.matches.map(g => `<li><i class="fas fa-check" style="color: #10b981; margin-right: 8px;"></i>${g}</li>`).join('') || '<li>None identified</li>';
            this.elements.divergentGenresList.innerHTML = result.divergences.map(g => `<li><i class="fas fa-bolt" style="color: #ef4444; margin-right: 8px;"></i>${g}</li>`).join('') || '<li>None identified</li>';

        } catch (e) {
            console.error("Comparison failed:", e);
            alert("Invalid Taste Card JSON. Please check and try again.");
        }
    },

    initOnboarding() {
        const hasSeenOnboarding = localStorage.getItem("onboarding_complete");
        if (hasSeenOnboarding) return;

        if (this.elements.onboardingModal) {
            this.elements.onboardingModal.style.display = "flex";
            setTimeout(() => this.elements.onboardingModal.classList.add("active"), 10);
        }

        if (this.elements.startOnboardingBtn) {
            this.elements.startOnboardingBtn.onclick = () => {
                this.elements.onboardingIntro.style.display = "none";
                this.elements.onboardingQuiz.style.display = "block";
                this.runOnboardingQuiz();
            };
        }

        if (this.elements.finishOnboardingBtn) {
            this.elements.finishOnboardingBtn.onclick = () => this.completeOnboarding();
        }

        if (this.elements.seedDnaBtn) {
            this.elements.seedDnaBtn.onclick = () => this.seedAndCompleteOnboarding();
        }
    },

    runOnboardingQuiz() {
        const questions = [
            {
                q: "Do you prefer stories grounded in gritty realism or whimsical fantasy?",
                options: [
                    { text: "Gritty Realism", metrics: { cognitiveLoad: 70, comfortScore: 30 } },
                    { text: "Whimsical Fantasy", metrics: { comfortScore: 70, cognitiveLoad: 40 } }
                ]
            },
            {
                q: "How do you feel about 'slow-burn' movies that take their time?",
                options: [
                    { text: "Love the depth.", metrics: { cognitiveLoad: 80 } },
                    { text: "Get to the point!", metrics: { comfortScore: 60, emotionalIntensity: 60 } }
                ]
            },
            {
                q: "Are you looking for a movie that will make you cry or feel intense emotion?",
                options: [
                    { text: "Yes, give me the feels.", metrics: { emotionalIntensity: 85 } },
                    { text: "No, I want to relax.", metrics: { comfortScore: 80 } }
                ]
            },
            {
                q: "Do you enjoy complex, non-linear plots that require focused attention?",
                options: [
                    { text: "Absolutely, I love puzzles.", metrics: { cognitiveLoad: 90 } },
                    { text: "I prefer straightforward stories.", metrics: { comfortScore: 75 } }
                ]
            },
            {
                q: "What matters more: stunning visual spectacle or thought-provoking subtext?",
                options: [
                    { text: "Visual Spectacle", metrics: { emotionalIntensity: 75, comfortScore: 50 } },
                    { text: "Thought-provoking Subtext", metrics: { cognitiveLoad: 85 } }
                ]
            }
        ];

        let currentStep = 0;
        const answers = [];

        const renderStep = () => {
            const step = questions[currentStep];
            this.elements.quizQuestion.textContent = step.q;
            this.elements.quizProgressText.textContent = `Question ${currentStep + 1} of 5`;
            this.elements.quizProgressBar.style.width = `${((currentStep + 1) / 5) * 100}%`;

            this.elements.quizOptions.innerHTML = "";
            step.options.forEach(opt => {
                const btn = document.createElement("button");
                btn.className = "save-btn";
                btn.style.cssText = "width: 100%; padding: 16px; border-radius: 12px; border: 1px solid var(--border-light); background: rgba(255,255,255,0.02); color: #fff; text-align: left; font-size: 1rem; transition: all 0.2s ease;";
                btn.textContent = opt.text;
                btn.onclick = () => {
                    answers.push(opt.metrics);
                    if (currentStep < 4) {
                        currentStep++;
                        renderStep();
                    } else {
                        this.showOnboardingResult(answers);
                    }
                };
                this.elements.quizOptions.appendChild(btn);
            });
        };

        renderStep();
    },

    async showOnboardingResult(answers) {
        // Average the metrics
        const finalMetrics = { emotionalIntensity: 0, cognitiveLoad: 0, comfortScore: 0 };
        answers.forEach(a => {
            if (a.emotionalIntensity) finalMetrics.emotionalIntensity += a.emotionalIntensity;
            if (a.cognitiveLoad) finalMetrics.cognitiveLoad += a.cognitiveLoad;
            if (a.comfortScore) finalMetrics.comfortScore += a.comfortScore;
        });

        // Normalize
        const count = answers.length;
        finalMetrics.avgEmotional = Math.round(finalMetrics.emotionalIntensity / 2); // Heuristic scaling
        finalMetrics.avgCognitive = Math.round(finalMetrics.cognitiveLoad / 2);
        finalMetrics.avgComfort = Math.round(finalMetrics.comfortScore / 2);

        const { computeArchetype } = await import('./src/archetype.js');
        const archetype = computeArchetype({
            totalMoviesSaved: 5,
            ...finalMetrics,
            genreCounts: {}
        });

        this.elements.onboardingQuiz.style.display = "none";
        this.elements.onboardingResult.style.display = "block";

        if (archetype) {
            this.elements.resultArchetypeLabel.textContent = archetype.label;
            this.elements.resultArchetypeDesc.textContent = archetype.description;
            // Store it
            localStorage.setItem("userProfile", JSON.stringify({ archetype: archetype.id }));
        }
    },

    async seedAndCompleteOnboarding() {
        try {
            const { store } = await import('./store.js');
            const { api } = await import('./api.js');

            // curated starter pack for any archetype (balanced)
            const starters = ["Inception", "The Grand Budapest Hotel", "Parasite", "Spider-Man: Into the Spider-Verse", "The Dark Knight"];

            this.elements.seedDnaBtn.textContent = "Seeding...";
            this.elements.seedDnaBtn.disabled = true;

            const results = await Promise.all(starters.map(t => api.searchMovies(t)));
            const movies = [];
            for (const r of results) {
                if (r && r[0]) {
                    const full = await api.fetchMovieById(r[0].imdbID);
                    if (full) movies.push(full);
                }
            }

            store.saveMoviesBatch(movies);
            // Also log them as reviews to trigger DNA
            movies.forEach(m => {
                store.saveReview({
                    id: m.id || m.imdbID,
                    title: m.title || m.Title,
                    poster: m.poster || m.Poster,
                    rating: 5,
                    text: "A cinematic masterpiece that define my taste.",
                    date: new Date().toLocaleDateString()
                });
            });

            this.completeOnboarding();
        } catch (e) {
            console.error("Seeding failed:", e);
            this.completeOnboarding();
        }
    },

    completeOnboarding() {
        localStorage.setItem("onboarding_complete", "true");
        this.elements.onboardingModal.classList.remove("active");
        setTimeout(() => {
            this.elements.onboardingModal.style.display = "none";
            this.loadCinemaDNA();
        }, 300);
    },

    renderArchetypeCard(archetype) {
        const titleEl = document.getElementById("archetype-label");
        const descEl = document.getElementById("archetype-description");
        const traitsEl = document.getElementById("archetype-traits");
        const iconWrapper = document.getElementById("archetype-icon-wrapper");

        if (archetype) {
            if (titleEl) titleEl.textContent = archetype.label;
            if (descEl) descEl.textContent = archetype.description;

            if (traitsEl) {
                traitsEl.innerHTML = archetype.dominantTraits.map(t => `<span class="dna-pill">${t}</span>`).join("");
            }

            if (iconWrapper && archetype.icon) {
                iconWrapper.innerHTML = `<i class="fas ${archetype.icon}"></i>`;
            }
        }
    },

    async openExportModal() {
        if (!this.state.latestDNA || this.state.latestDNA.totalReviews === 0) {
            const { store } = await import('./store.js');
            const fresh = await store.computeUserAnalytics();
            this.state.latestDNA = fresh;
            if (fresh.totalReviews === 0) {
                alert("You need to write at least one review to generate your premium DNA card!");
                return;
            }
        }

        const dna = this.state.latestDNA;
        const modal = this.elements.dnaCardModal;

        // Populate Data
        document.getElementById("export-date").textContent = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
        document.getElementById("export-archetype").textContent = dna.archetype?.label || "The Cinematic Soul";
        document.getElementById("export-desc").textContent = dna.archetype?.description || "A unique blend of cinematic preferences and storytelling appreciation.";
        document.getElementById("export-genre").textContent = dna.favoriteGenre || "Various";
        document.getElementById("export-rating").textContent = dna.avgRating || "0.0";
        document.getElementById("export-reviews").textContent = dna.totalReviews || "0";

        const iconEl = document.getElementById("export-icon");
        if (iconEl && dna.archetype?.icon) {
            iconEl.innerHTML = `<i class="fas ${dna.archetype.icon}"></i>`;
        }

        modal.style.display = "flex";
        setTimeout(() => modal.classList.add("active"), 10);
    },

    async loadTrends() {
        try {
            const { eventStore } = await import('./src/eventStore.js');
            const trends = eventStore.computeTrends();
            const container = document.getElementById("trends-container");
            if (!trends) {
                if (container) container.style.display = "none";
                return;
            }

            if (container) container.style.display = "block";
            const badge = document.getElementById("trend-badge");
            const insight = document.getElementById("trends-insight");

            // Set Badge
            const primaryChange = trends.changes.avgEmotional;
            if (badge) {
                badge.style.display = "block";
                badge.textContent = `${primaryChange >= 0 ? '+' : ''}${Math.round(primaryChange)}%`;
                badge.style.background = primaryChange >= 0 ? "rgba(46, 204, 113, 0.2)" : "rgba(231, 76, 60, 0.2)";
                badge.style.color = primaryChange >= 0 ? "#2ecc71" : "#e74c3c";
            }

            if (insight) insight.textContent = trends.summary;

            // Render Sparkline
            this.renderSparkline("trends-canvas", trends.weekly.map(w => w.avgEmotional), "#ff0f7b");

            // Setup Modal Trigger
            if (container) {
                container.onclick = () => this.openTrendsModal(trends);
            }

        } catch (e) {
            console.error("Trends render failed:", e);
        }
    },

    renderSparkline(canvasId, data, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, rect.width, rect.height);

        if (data.length < 2) return;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const step = rect.width / (data.length - 1);
        const min = 0;
        const max = 100;
        const range = max - min;

        data.forEach((val, i) => {
            const x = i * step;
            const y = rect.height - ((val - min) / range) * rect.height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Area under
        ctx.lineTo(rect.width, rect.height);
        ctx.lineTo(0, rect.height);
        const grad = ctx.createLinearGradient(0, 0, 0, rect.height);
        const rgbaColor = color.replace('hsl', 'hsla').replace(')', ', 0.2)');
        grad.addColorStop(0, rgbaColor.includes('#') ? color + '33' : rgbaColor);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();
    },

    openTrendsModal(trends) {
        const modal = document.getElementById("trends-detail-modal");
        if (!modal) return;

        modal.style.display = "flex";
        setTimeout(() => modal.classList.add("active"), 10);

        // Render Detailed Graph
        const detailedCanvas = document.getElementById("detailed-trends-canvas");
        this.drawTrendCurve(detailedCanvas, trends.weekly);

        // Update Vals
        const intVal = document.getElementById("trend-intensity-val");
        const cogVal = document.getElementById("trend-cognitive-val");
        const descVal = document.getElementById("trends-long-description");

        if (intVal) intVal.textContent = `${trends.changes.avgEmotional >= 0 ? '+' : ''}${Math.round(trends.changes.avgEmotional)}%`;
        if (cogVal) cogVal.textContent = `${trends.changes.avgCognitive >= 0 ? '+' : ''}${Math.round(trends.changes.avgCognitive)}%`;
        if (descVal) descVal.textContent = trends.summary + " This analysis is based on your viewing history over the last " + trends.weekly.length + " weeks.";

        const closeBtn = document.getElementById("close-trends-modal");
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.classList.remove("active");
                setTimeout(() => modal.style.display = "none", 400);
            };
        }
    },

    drawTrendCurve(canvas, weeklyData) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, rect.width, rect.height);

        const drawLine = (data, glyph, color, label) => {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            const step = rect.width / (data.length - 1);
            data.forEach((v, i) => {
                const x = i * step;
                const y = rect.height - (v / 100 * rect.height);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();

            // Legend/Label hint
            ctx.fillStyle = color;
            ctx.font = "700 12px Inter";
            const lastVal = data[data.length - 1];
            ctx.fillText(label, rect.width - 60, rect.height - (lastVal / 100 * rect.height) - 10);
        };

        drawLine(weeklyData.map(w => w.avgEmotional), "i", "#ff0f7b", "Intensity");
        drawLine(weeklyData.map(w => w.avgCognitive), "c", "#2df9fe", "Cognitive");
    },

    async openZeroScroll() {
        document.body.classList.add("zero-scroll-active");
        this.elements.zeroScrollModal.style.display = "flex";
        setTimeout(() => this.elements.zeroScrollModal.classList.add("active"), 10);

        this.trapFocus(this.elements.zeroScrollModal);
        await this.spinZeroScroll();
    },

    closeZeroScroll() {
        if (this.elements.zeroScrollModal) {
            this.elements.zeroScrollModal.classList.remove("active");
            setTimeout(() => {
                this.elements.zeroScrollModal.style.display = "none";
                document.body.classList.remove("zero-scroll-active");
            }, 400);
        }
    },

    async spinZeroScroll() {
        const { decisionEngine } = await import('./src/decisionEngine.js');
        const results = await decisionEngine({ mood: 'auto', time: 'auto', company: 'auto', epsilon: 0.15 });

        try {
            const { eventStore } = await import('./src/eventStore.js');
            eventStore.logEvent('zero-scroll-spin', null);
        } catch (e) { }

        this.renderZeroScrollResults(results);
    },

    renderZeroScrollResults(movies) {
        if (!this.elements.zeroScrollResults) return;
        this.elements.zeroScrollResults.innerHTML = "";

        movies.forEach(m => {
            const card = document.createElement("div");
            card.className = "movie-card";
            const fallback = "https://placehold.co/300x450/111/555?text=No+Poster";
            const cover = (m.Poster && m.Poster !== "N/A") ? m.Poster : (m.poster && m.poster !== "N/A") ? m.poster : fallback;

            const riskBadge = this.getRegRiskBadgeHTML(m);

            card.innerHTML = `
              ${riskBadge}
              <img src="${cover}" alt="${m.title || m.Title}" onerror="this.src='${fallback}'">
              <div class="card-overlay active" style="background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; opacity: 1;">
                <div class="movie-info" style="transform: none; opacity: 1;">
                  <h3 style="font-size: 1.2rem; margin-bottom: 8px; color: #fff;">${m.title || m.Title}</h3>
                  <p class="plot-text" style="font-size: 0.85rem; -webkit-line-clamp: 3; line-clamp: 3; color: #ccc;">${m.explain || m.plot || m.Plot || "A curated choice for you."}</p>
                  <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
                    <button class="btn-primary accept-btn" style="padding: 10px; font-size: 0.85rem; border-radius: 8px;">
                        <i class="fas fa-play"></i> Accept & Play
                    </button>
                    <button class="btn-secondary w-btn" style="padding: 10px; font-size: 0.85rem; background: rgba(255,255,255,0.1); color: #fff; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">
                        <i class="fas fa-bookmark"></i> Save to Watchlist
                    </button>
                  </div>
                </div>
              </div>`;

            card.querySelector('.accept-btn').onclick = () => {
                alert(`Enjoy ${m.title || m.Title}! Loading player...`);
                this.closeZeroScroll();
            };
            card.querySelector('.w-btn').onclick = async () => {
                const { store } = await import('./store.js');
                const added = await store.toggleWatchlist(m);
                alert(added ? "Added to watchlist!" : "Removed from watchlist!");
            };

            this.elements.zeroScrollResults.appendChild(card);
        });
    },

    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0) return;
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        const handleKeydown = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        if (modal._trapHandler) modal.removeEventListener('keydown', modal._trapHandler);
        modal._trapHandler = handleKeydown;
        modal.addEventListener('keydown', handleKeydown);

        firstFocusableElement.focus();
    },

    drawDNAChart(genreCounts) {
        const canvas = document.getElementById("dna-chart");
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const entries = Object.values(genreCounts);
        if (entries.length === 0) {
            ctx.fillStyle = '#9ca3af';
            ctx.font = '14px Inter, sans-serif';
            ctx.fillText("No data to display.", 20, 30);
            return;
        }

        const points = [];
        const numPoints = 20;
        let currentY = canvas.height / 2;

        for (let i = 0; i < numPoints; i++) {
            const seed = entries[i % entries.length] || 1;
            const volatility = (Math.random() - 0.5) * (seed * 5);
            currentY = Math.max(10, Math.min(canvas.height - 10, currentY + volatility));
            points.push({
                x: (i / (numPoints - 1)) * canvas.width,
                y: currentY
            });
        }

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length - 1; i++) {
            const xMid = (points[i].x + points[i + 1].x) / 2;
            const yMid = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xMid, yMid);
        }
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.stroke();
    },

    generateShareCard(analytics) {
        const canvas = document.getElementById("dna-share-canvas");
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Matte Background
        ctx.fillStyle = '#111216'; // Darker theme
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Subtle Gradient Overlay
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, 'rgba(255, 15, 123, 0.05)');
        grad.addColorStop(1, 'rgba(45, 249, 254, 0.05)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header
        ctx.fillStyle = '#ff0f7b'; // accent-primary
        ctx.font = 'bold 50px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("CinemaDNA", canvas.width / 2, 100);

        ctx.fillStyle = '#9ca3af'; // var(--text-muted)
        ctx.font = '24px Inter, sans-serif';
        ctx.fillText("My Cinematic Persona", canvas.width / 2, 145);

        // Divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(100, 185);
        ctx.lineTo(700, 185);
        ctx.stroke();

        // Archetype Section (Prominent)
        if (analytics.archetype) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 64px Poppins, sans-serif';
            ctx.fillText(analytics.archetype.label, canvas.width / 2, 280);

            ctx.fillStyle = '#2df9fe'; // accent-secondary
            ctx.font = '800 24px Inter, sans-serif';
            ctx.fillText(`MATCH CONFIDENCE: ${analytics.archetype.confidence}%`, canvas.width / 2, 330);

            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = 'italic 22px Inter, sans-serif';
            ctx.fillText(analytics.archetype.dominantTraits.join(" • "), canvas.width / 2, 375);
        }

        ctx.textAlign = 'left';

        // Draw Row Helper
        const drawRow = (label, val, y, color) => {
            ctx.fillStyle = '#9ca3af';
            ctx.font = '28px Inter, sans-serif';
            ctx.fillText(label, 120, y);

            ctx.fillStyle = color;
            ctx.font = '800 36px Poppins, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(val, 680, y + 5);
            ctx.textAlign = 'left';
        };

        const rowStart = 480;
        const rowGap = 90;

        // Key Stats
        drawRow("Top Genre", analytics.favoriteGenre, rowStart, "#2ecc71");
        drawRow("Mood Trend", analytics.moodTrend, rowStart + rowGap, "#ecf0f1");

        // Top Directors Section
        ctx.fillStyle = '#9ca3af';
        ctx.font = '28px Inter, sans-serif';
        ctx.fillText("Top Directors:", 120, rowStart + (rowGap * 2.5));

        ctx.fillStyle = '#f3f4f6';
        ctx.font = 'bold 30px Poppins, sans-serif';
        const dirs = (analytics.top5Directors || []).length ? analytics.top5Directors.join(', ') : "None";
        ctx.fillText(dirs.length > 35 ? dirs.substring(0, 32) + "..." : dirs, 120, rowStart + (rowGap * 3.1));

        // Footer
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = '20px Inter, monospace';
        ctx.textAlign = 'center';
        ctx.fillText("Generated by CineSins • cinemadna.app", canvas.width / 2, 1140);

        // Trigger Download
        const link = document.createElement('a');
        link.download = `CinemaDNA_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    },

    generateCompatShareCard(compatResult) {
        const canvas = this.elements.compatShareCanvas;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("Movie Compatibility", canvas.width / 2, 60);

        ctx.fillStyle = '#aaaaaa';
        ctx.font = 'italic 20px sans-serif';
        ctx.fillText("Analyzed by CineSins", canvas.width / 2, 95);

        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, 130);
        ctx.lineTo(550, 130);
        ctx.stroke();

        ctx.textAlign = 'center';

        ctx.fillStyle = '#888888';
        ctx.font = '24px sans-serif';
        ctx.fillText("Compatibility Score", canvas.width / 2, 200);

        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 64px sans-serif';
        ctx.fillText(`${compatResult.percentage}%`, canvas.width / 2, 270);

        ctx.fillStyle = '#888888';
        ctx.font = '24px sans-serif';
        ctx.fillText("Shared DNA Genres", canvas.width / 2, 360);

        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 28px sans-serif';
        const genres = compatResult.commonGenres.length ? compatResult.commonGenres.join(', ') : "None";
        ctx.fillText(genres.length > 35 ? genres.substring(0, 32) + "..." : genres, canvas.width / 2, 410);

        ctx.fillStyle = '#888888';
        ctx.font = '24px sans-serif';
        ctx.fillText("Top Joint Pick", canvas.width / 2, 530);

        ctx.fillStyle = '#3498db';
        ctx.font = 'bold 36px sans-serif';
        const bestMovie = compatResult.suggestedMovies.length ? (compatResult.suggestedMovies[0].Title || compatResult.suggestedMovies[0].title) : "Unknown";
        ctx.fillText(bestMovie.length > 25 ? bestMovie.substring(0, 22) + "..." : bestMovie, canvas.width / 2, 590);

        ctx.fillStyle = '#444444';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("Generated on " + new Date().toLocaleDateString(), canvas.width / 2, 760);

        const link = document.createElement('a');
        link.download = `Compatibility_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    },

    async loadWatchlist() {
        const { store } = await import('./store.js');
        const wl = store.getWatchlist();
        this.elements.watchlistList.innerHTML = "";

        if (!wl.length) {
            this.elements.watchlistList.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px; opacity: 0.5;">
                    <i class="fas fa-bookmark" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <p>Your watchlist is empty.</p>
                </div>`;
            return;
        }

        const cards = [];
        wl.forEach(m => {
            const card = document.createElement("div");
            card.className = "movie-card";

            const fallback = "https://placehold.co/300x450/111/555?text=No+Poster";
            const rawPoster = m.poster || m.Poster || fallback;
            const posterUrl = this.getHighResPoster(rawPoster);

            card.innerHTML = `
              <img src="${posterUrl}" class="movie-card-img" alt="${m.title || m.Title}" onerror="this.src='${fallback}'">
              <div class="movie-card-overlay">
                <div class="movie-card-info">
                  <h3 class="movie-card-title">${m.title || m.Title}</h3>
                  <div class="movie-card-meta">
                    <span>${m.year || m.Year}</span>
                    <span class="badge badge-velvet" data-action="remove-watchlist" data-id="${m.imdbID || m.id}" style="cursor: pointer; margin-left: auto;">
                        <i class="fas fa-trash"></i>
                    </span>
                  </div>
                </div>
              </div>`;

            card.dataset.id = m.imdbID || m.id;
            if (!this.state.renderedWatchlistMap) this.state.renderedWatchlistMap = {};
            this.state.renderedWatchlistMap[m.imdbID || m.id] = m;

            this.elements.watchlistList.appendChild(card);
            cards.push(card);
        });

        this.elements.watchlistList.onclick = (e) => {
            const btn = e.target.closest('[data-action="remove-watchlist"]');
            const card = e.target.closest('.movie-card');

            if (btn && btn.dataset.action === "remove-watchlist") {
                const movieId = btn.dataset.id;
                const movie = this.state.renderedWatchlistMap[movieId];
                if (movie) {
                    store.toggleWatchlist(movie);
                    this.loadWatchlist();
                }
                return;
            }

            if (card) {
                const movieId = card.dataset.id;
                const movie = this.state.renderedWatchlistMap[movieId];
                const posterImg = card.querySelector('img');
                if (movie) this.openModal(movie, posterImg);
            }
        };

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && cards.length > 0) {
            gsap.registerPlugin(ScrollTrigger);
            ScrollTrigger.batch(cards, {
                onEnter: batch => gsap.to(batch, {
                    opacity: 1,
                    y: 0,
                    stagger: 0.1,
                    duration: 0.6,
                    ease: "power2.out",
                    overwrite: true
                }),
                start: "top 90%",
            });
        }
    },

    showSpinner() {
        const skeletons = Array(8).fill(`
            <div class="movie-card skeleton-card">
              <div class="skeleton skeleton-img"></div>
              <div class="card-overlay" style="opacity: 1; transform: none; background: transparent; pointer-events: none;">
                <div class="movie-info" style="width: 100%;">
                  <div class="skeleton skeleton-text skeleton-title"></div>
                  <div class="skeleton skeleton-text skeleton-year"></div>
                  <div class="skeleton skeleton-text skeleton-desc" style="margin-top: 15px;"></div>
                  <div class="skeleton skeleton-text skeleton-desc" style="width: 80%;"></div>
                  <div class="skeleton skeleton-btn" style="margin-top: 20px;"></div>
                </div>
              </div>
            </div>
        `).join('');
        this.elements.movieResults.innerHTML = skeletons;
    },

    async loadInitialMovies() {
        this.showSpinner();

        try {
            const validMovies = await api.fetchPopularMoviesBatch();

            if (validMovies && validMovies.length > 0) {
                const { store } = await import('./store.js');
                store.saveMoviesBatch(validMovies);
                this.renderMovies(validMovies, this.elements.movieResults);
                this.completeLoader();
            } else {
                throw new Error("No movies returned from batch fetch.");
            }
        } catch (e) {
            console.error("Failed to load initial movies:", e);
            const { store } = await import('./store.js');
            const localMovies = store.getAllMovies();
            if (localMovies && localMovies.length > 0) {
                this.renderMovies(localMovies.slice(-10).reverse(), this.elements.movieResults);
                this.completeLoader();
            } else {
                this.completeLoader();
                this.elements.movieResults.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: rgba(204, 0, 0, 0.1); border: 1px dashed #cc0000; border-radius: 12px;">
                        <i class="fas fa-exclamation-circle" style="font-size: 2rem; color: #cc0000; margin-bottom: 15px;"></i>
                        <p style="color: white; font-weight: bold;">Movie APIs are currently unreachable.</p>
                        <button onclick="window.location.reload()" style="margin-top: 15px; padding: 8px 20px; background: #cc0000; color: white; border: none; border-radius: 20px; cursor: pointer;">Retry</button>
                    </div>`;
            }
        }
    },

    async loadHiddenGems() {
        if (!this.elements.hiddenGemsResults) return;

        // Show skeleton while loading
        this.elements.hiddenGemsResults.innerHTML = Array(6).fill(`
            <div class="gem-card" style="opacity: 0.4;">
                <div style="width:110px;min-height:165px;background:var(--surface-light);border-radius:10px;"></div>
                <div class="gem-card-info" style="flex:1;">
                    <div style="width:60%;height:18px;background:var(--surface-light);border-radius:6px;"></div>
                    <div style="width:40%;height:12px;background:var(--surface-light);border-radius:6px;"></div>
                    <div style="width:90%;height:50px;background:var(--surface-light);border-radius:6px;margin-top:8px;"></div>
                </div>
            </div>`).join('');

        try {
            const gems = await api.fetchHiddenGemsBatch();
            if (!gems || gems.length === 0) {
                this.elements.hiddenGemsResults.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No hidden gems found at this time.</p>`;
                return;
            }

            const { store } = await import('./store.js');
            store.saveMoviesBatch(gems);

            // Generate gem reasons — try AI first, fallback to local heuristics
            const reasons = await this.generateGemReasons(gems);

            this.elements.hiddenGemsResults.innerHTML = '';
            if (!this.state.renderedMoviesMaps) this.state.renderedMoviesMaps = {};
            this.state.renderedMoviesMaps['hidden-gems-results'] = {};

            gems.forEach((m, i) => {
                const fallback = "https://placehold.co/300x450/111/555?text=No+Poster";
                const rawPoster = (m.Poster && m.Poster !== "N/A") ? m.Poster : (m.poster && m.poster !== "N/A") ? m.poster : fallback;
                const posterUrl = this.getHighResPoster(rawPoster);
                const title = m.Title || m.title || "Unknown";
                const year = m.Year || m.year || "";
                const rating = m.imdbRating || "N/A";
                const genres = m.genres || m.Genre || "";
                const reason = reasons[i] || "A critically acclaimed film that deserves more attention.";

                const card = document.createElement('div');
                card.className = 'gem-card';
                card.dataset.id = m.imdbID || m.id;

                card.innerHTML = `
                    <img class="gem-card-poster" src="${posterUrl}" alt="${title}" onerror="this.src='${fallback}'">
                    <div class="gem-card-info">
                        <div class="gem-badge"><i class="fas fa-gem"></i> Hidden Gem</div>
                        <h3>${title}</h3>
                        <div class="gem-meta">${year} • IMDb: ${rating} • ${genres}</div>
                        <div class="gem-reason"><i class="fas fa-brain" style="color: #cc0000; margin-right: 6px;"></i>${reason}</div>
                    </div>`;

                this.state.renderedMoviesMaps['hidden-gems-results'][m.imdbID || m.id] = m;
                this.elements.hiddenGemsResults.appendChild(card);
            });

            // Click handler for opening modal
            this.elements.hiddenGemsResults.onclick = (e) => {
                const card = e.target.closest('.gem-card');
                if (!card) return;
                const movieId = card.dataset.id;
                const movie = this.state.renderedMoviesMaps['hidden-gems-results']?.[movieId];
                const posterImg = card.querySelector('.gem-card-poster');
                if (movie) this.openModal(movie, posterImg);
            };

            this.refreshUI();
        } catch (e) {
            console.error("Failed to load hidden gems:", e);
            this.elements.hiddenGemsResults.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Could not load hidden gems.</p>`;
        }
    },

    async loadRegions() {
        const container = this.elements.regionsContainer || document.getElementById("regions-container");
        if (!container) return;

        container.innerHTML = '<div style="text-align: center; padding: 80px;"><i class="fas fa-globe-americas fa-spin" style="font-size: 2.5rem; color: var(--accent-secondary);"></i><p style="margin-top: 20px; color: var(--text-muted); font-size: 0.9rem; letter-spacing: 2px; text-transform: uppercase;">Discovering Global Cinematic Hubs...</p></div>';

        try {
            const { REGIONS, REGION_SAMPLES } = await import('./src/regionData.js');

            // 1. SEEDING STRATEGY: Ensure library has regional data
            let allMovies = store.getAllMovies();
            const hasRegionalData = allMovies.some(m => m.regionTags && m.regionTags.length > 0);

            if (allMovies.length < 5 || !hasRegionalData) {
                const detailedSamples = await Promise.all(
                    REGION_SAMPLES.map(async s => {
                        try {
                            const m = await api.fetchMovieById(s.id);
                            if (m) {
                                m.regionTags = [s.region];
                                return m;
                            }
                        } catch (e) { }

                        // ABSOLUTE FALLBACK: Static entry if API fails completely
                        return {
                            id: s.id,
                            imdbID: s.id,
                            Title: s.title,
                            Poster: `https://placehold.co/300x450/111/555?text=${s.title.replace(' ', '+')}`,
                            regionTags: [s.region],
                            primaryLanguage: s.language,
                            imdbRating: "8.5",
                            Year: "2023"
                        };
                    })
                );
                store.saveMoviesBatch(detailedSamples.filter(Boolean));
                allMovies = store.getAllMovies();
            }

            container.innerHTML = '';

            for (const [key, region] of Object.entries(REGIONS)) {
                // Improved filtering: case-insensitive language matching
                const regionalMovies = allMovies.filter(m =>
                    (m.regionTags && m.regionTags.includes(key)) ||
                    (m.primaryLanguage && region.languages.includes(m.primaryLanguage.toLowerCase()))
                );

                const count = regionalMovies.length || "Featured";
                const item = document.createElement('div');
                item.className = 'dna-tile';
                item.style.cssText = 'margin-bottom: 24px; padding: 0; display: block; overflow: hidden;';

                item.innerHTML = `
                    <div class="region-header" style="padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <div style="display: flex; align-items: center; gap: 20px;">
                            <div style="font-size: 1.5rem; color: var(--accent-secondary);"><i class="fas fa-landmark"></i></div>
                            <div>
                                <h3 style="font-size: 1.8rem; color: #fff; line-height: 1; font-weight: 800;">${region.label}</h3>
                                <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 6px;">${count} movies identified in your collection</p>
                            </div>
                        </div>
                        <i class="fas fa-chevron-down" style="color: var(--accent-secondary); transition: transform 0.4s ease;"></i>
                    </div>
                    <div class="region-detail" style="max-height: 0; overflow: hidden; transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);">
                        <div style="padding: 32px; border-top: 1px solid var(--border-light); background: linear-gradient(to bottom, rgba(0,0,0,0.4), transparent);">
                            <p style="color: var(--text-secondary); line-height: 1.7; margin-bottom: 32px; font-size: 1.1rem; max-width: 800px; font-style: italic; opacity: 0.8;">"${region.blurb}"</p>
                            
                            <div class="movie-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 24px;">
                                ${regionalMovies.length > 0 ? regionalMovies.slice(0, 12).map(m => `
                                    <div class="movie-card" style="height: 280px;" data-id="${m.id || m.imdbID}">
                                        <img src="${this.getHighResPoster(m.Poster || m.poster || 'https://placehold.co/300x450/111/555?text=No+Poster')}" alt="${m.Title}" style="height: 100%; object-fit: cover; border-radius: 8px;">
                                        <div class="card-overlay" style="opacity: 1; background: linear-gradient(to top, rgba(0,0,0,0.95), transparent 70%); display: flex; align-items: flex-end; padding: 15px;">
                                            <div>
                                                <p style="font-size: 0.6rem; color: var(--accent-secondary); text-transform: uppercase; font-weight: 900; margin-bottom: 2px;">★ ${m.imdbRating || "8.1"}</p>
                                                <p style="font-size: 0.85rem; font-weight: 800; color: #fff; margin: 0; line-height: 1.2;">${m.Title}</p>
                                            </div>
                                        </div>
                                    </div>
                                `).join('') : `
                                    <div style="grid-column: 1/-1; padding: 40px; text-align: center; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px dashed var(--border-light);">
                                        <p style="color: var(--text-muted);">No movies discovered for this region yet.</p>
                                        <button class="dna-btn secondary" style="margin: 15px auto 0; padding: 8px 20px; font-size: 0.8rem;">Explore Popular ${region.label} Films</button>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                `;

                const header = item.querySelector('.region-header');
                header.onclick = () => {
                    const detail = item.querySelector('.region-detail');
                    const chevron = item.querySelector('.fa-chevron-down');
                    const isOpen = detail.style.maxHeight !== '0px' && detail.style.maxHeight !== '';

                    // Close others
                    container.querySelectorAll('.region-detail').forEach(d => {
                        if (d !== detail) {
                            d.style.maxHeight = '0';
                            d.parentElement.querySelector('.fa-chevron-down').style.transform = 'rotate(0deg)';
                        }
                    });

                    if (!isOpen) {
                        detail.style.maxHeight = '2000px';
                        chevron.style.transform = 'rotate(180deg)';
                    } else {
                        detail.style.maxHeight = '0';
                        chevron.style.transform = 'rotate(0deg)';
                    }
                };

                // Regional movie card clicks
                item.querySelectorAll('.movie-card').forEach(card => {
                    card.onclick = (e) => {
                        e.stopPropagation();
                        const movieId = card.dataset.id;
                        const movie = regionalMovies.find(m => (m.id || m.imdbID) === movieId);
                        if (movie) this.openModal(movie, card.querySelector('img'));
                    };
                });

                container.appendChild(item);
            }
            this.refreshUI();
        } catch (e) {
            console.error("Failed to load regions:", e);
            container.innerHTML = `<div style="text-align: center; padding: 60px;"><p style="color: var(--accent-primary);">Failed to load cinematic regions. Please check your connection.</p></div>`;
        }
    },

    async generateGemReasons(movies) {
        try {
            const { aiService } = await import('./ai_service.js');
            const titles = movies.map(m => m.Title || m.title).join(', ');
            const prompt = `For each of these movies, give exactly one short sentence (max 20 words) explaining why it's a "hidden gem" that most people missed. Return a JSON array of strings in the same order. Movies: ${titles}`;
            const response = await aiService.generateResponse(prompt, "You are a film critic. Respond ONLY with a JSON array of strings.");

            const jsonMatch = response.match(/\[.*\]/s);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed) && parsed.length >= movies.length) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn("AI gem reasons failed, using local fallback:", e);
        }

        // Local heuristic fallback
        return movies.map(m => {
            const rating = parseFloat(m.imdbRating) || 0;
            const genres = (m.genres || m.Genre || "").toLowerCase();
            if (rating >= 8.5) return "Near-perfect critical score yet rarely discussed in mainstream circles.";
            if (genres.includes("drama") && genres.includes("romance")) return "A deeply emotional story with performances that linger long after the credits.";
            if (genres.includes("thriller")) return "A masterful slow-burn that rewards patient, attentive viewers.";
            if (genres.includes("animation")) return "Visually breathtaking with layers of meaning beneath the surface.";
            if (genres.includes("war") || genres.includes("history")) return "A powerful lens into history that avoids Hollywood clichés.";
            if (rating >= 7.5) return "Highly rated by critics but overlooked by the mainstream audience.";
            return "A distinctive cinematic voice that challenges conventional storytelling.";
        });
    }
};
