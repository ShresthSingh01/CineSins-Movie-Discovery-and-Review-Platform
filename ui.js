import { api } from './api.js';
import { store } from './store.js';
import { config } from './config.js';

export const ui = {
    elements: {},
    state: {
        currentMovie: null,
        selectedRating: 0
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
        this.applyFeatureFlags();

        this.elements = {
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
            hiddenGemsList: document.getElementById("hidden-gems-list"),
            cinemadnaList: document.getElementById("dna-directors"),
            dnaGenre: document.getElementById("dna-genre"),
            dnaRating: document.getElementById("dna-rating"),
            dnaMood: document.getElementById("dna-mood"),
            dnaReviews: document.getElementById("dna-reviews"),
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
            importTagsBtn: document.getElementById("import-tags-btn"),
            exportTagsBtn: document.getElementById("export-tags-btn"),
            importFile: document.getElementById("import-file"),
            calcCompatBtn: document.getElementById("calc-compat-btn"),
            compatResults: document.getElementById("compat-results"),
            compatScore: document.getElementById("compat-score"),
            compatGenres: document.getElementById("compat-genres"),
            compatMoviesList: document.getElementById("compat-movies-list"),
            generateCompatShareBtn: document.getElementById("generate-compat-share-btn"),
            compatShareCanvas: document.getElementById("compat-share-canvas")
        };

        this.setupNavigation();
        this.setupEventListeners();
        this.loadRecent();
        this.loadInitialMovies();
    },

    setupNavigation() {
        const mobileMenuBtn = document.getElementById("mobile-menu-btn");
        const mainNav = document.getElementById("main-nav");

        if (mobileMenuBtn && mainNav) {
            mobileMenuBtn.addEventListener("click", () => {
                const isActive = mainNav.classList.toggle("active");
                mobileMenuBtn.innerHTML = isActive ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            });
        }

        document.querySelectorAll("nav a[data-section]").forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();

                // Close mobile menu on click
                if (mainNav && mainNav.classList.contains("active")) {
                    mainNav.classList.remove("active");
                    if (mobileMenuBtn) mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }

                if (link.dataset.section === "decision-mode") {
                    document.getElementById("decision-modal").classList.add("active");
                    return;
                }

                document.querySelectorAll("nav a[data-section]").forEach(a => a.classList.remove("active"));
                link.classList.add("active");
                document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active"));
                document.getElementById(link.dataset.section).classList.add("active");
                if (link.dataset.section === "reviews") this.loadUserReviews();
                if (link.dataset.section === "watchlist") this.loadWatchlist();
                if (link.dataset.section === "hidden-gems") this.loadHiddenGems();
                if (link.dataset.section === "cinemadna") this.loadCinemaDNA();
                if (link.dataset.section === "compatibility") {
                    // Reset or prepare compatibility view if needed
                }
            });
        });
    },

    setupEventListeners() {
        this.elements.searchBtn.onclick = () => this.searchMovies();
        this.elements.searchInput.addEventListener("keypress", e => {
            if (e.key === "Enter") this.searchMovies();
        });
        this.elements.reviewText.oninput = () => {
            this.elements.charCount.textContent = this.elements.reviewText.value.length + "/300";
        };
        this.elements.closeModal.onclick = () => this.closeReviewModal();
        this.elements.saveBtn.onclick = () => this.saveReview();
        this.elements.watchlistBtn.onclick = () => this.toggleWatchlist();

        // Scene Tags Events
        this.elements.addTagBtn.onclick = () => this.addTagToCurrentMovie();
        this.elements.newTagInput.addEventListener("keypress", e => {
            if (e.key === "Enter") this.addTagToCurrentMovie();
        });

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

        this.elements.importTagsBtn.onclick = (e) => {
            e.preventDefault();
            this.elements.importFile.click();
        };

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

        // Compatibility Mode Events
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
                // Pre-seed if needed before calling compatibility
                if (store.getAllMovies().length < 50) {
                    await store.seedMoviesIfNeeded();
                }

                const storeCompatResult = computeCompatibility([...moviesA], [...moviesB]);

                this.elements.compatScore.textContent = storeCompatResult.percentage;
                this.elements.compatGenres.textContent = storeCompatResult.commonGenres.length ? storeCompatResult.commonGenres.join(', ') : "None";
                this.elements.compatMoviesList.innerHTML = storeCompatResult.suggestedMovies.length ? "" : "<p>No suggestions found.</p>";
                storeCompatResult.suggestedMovies.forEach(m => {
                    const card = document.createElement("div");
                    card.className = "movie-card";
                    const fallback = "https://placehold.co/300x450/111/555?text=No+Poster";
                    const cover = (m.Poster && m.Poster !== "N/A") ? m.Poster : (m.poster && m.poster !== "N/A") ? m.poster : fallback;

                    card.innerHTML = `
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
                    if (!this.state.renderedMoviesMap) this.state.renderedMoviesMap = {};
                    this.state.renderedMoviesMap[m.imdbID || m.id] = m;

                    card.querySelector(".review-btn").addEventListener("click", () => this.openModal(m));
                    this.elements.compatMoviesList.appendChild(card);
                });

                this.elements.generateCompatShareBtn.onclick = () => {
                    this.generateCompatShareCard(storeCompatResult);
                };

                this.elements.compatResults.style.display = "block";
            } catch (err) {
                console.error(err);
                alert("An error occurred computing compatibility.");
            } finally {
                this.elements.calcCompatBtn.textContent = "Calculate Compatibility";
                this.elements.calcCompatBtn.disabled = false;
            }
        };

        this.elements.generateShareBtn.onclick = () => {
            if (!this.state.latestDNA) {
                alert("Please load CinemaDNA and write some reviews first.");
                return;
            }
            this.generateShareCard(this.state.latestDNA);
        };

        // Decision Mode Events
        this.elements.decisionBtn.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            this.elements.decisionModal.style.display = "flex";
            setTimeout(() => this.elements.decisionModal.classList.add("active"), 10);
            this.elements.decisionResults.innerHTML = "";
        });
        this.elements.closeDecisionModal.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            this.elements.decisionModal.classList.remove("active");
            setTimeout(() => {
                this.elements.decisionModal.style.display = "none";
            }, 400);
        });
        this.elements.getRecommendationsBtn.addEventListener('click', async (e) => {
            if (e) e.preventDefault();
            const options = {
                mood: this.elements.decisionMood.value,
                time: parseInt(this.elements.decisionTime.value, 10),
                company: this.elements.decisionCompany.value
            };

            this.elements.decisionResults.innerHTML = '<div class="spinner" style="margin: 20px auto;"></div>';

            const { decisionEngine } = await import('./store.js');
            const recommendations = await decisionEngine(options);

            this.elements.decisionResults.innerHTML = "";
            if (recommendations.length === 0) {
                this.elements.decisionResults.innerHTML = "<p>No matches found. Try changing filters.</p>";
                return;
            }
            recommendations.forEach(m => {
                const metricsHtml = m.metrics ? `
                  <div class="metrics-container">
                    <div class="metric-row">
                      <span class="metric-label">Emotional</span>
                      <div class="metric-bar"><div class="metric-fill emotional" style="width: ${m.metrics.emotionalIntensity}%"></div></div>
                      <span class="metric-value">${m.metrics.emotionalIntensity}</span>
                    </div>
                    <div class="metric-row">
                      <span class="metric-label">Cognitive</span>
                      <div class="metric-bar"><div class="metric-fill cognitive" style="width: ${m.metrics.cognitiveLoad}%"></div></div>
                      <span class="metric-value">${m.metrics.cognitiveLoad}</span>
                    </div>
                    <div class="metric-row">
                      <span class="metric-label">Comfort</span>
                      <div class="metric-bar"><div class="metric-fill comfort" style="width: ${m.metrics.comfortScore}%"></div></div>
                      <span class="metric-value">${m.metrics.comfortScore}</span>
                    </div>
                  </div>
                ` : '';

                const card = document.createElement("div");
                card.className = "movie-card";
                card.innerHTML = `
          <div class="movie-info">
            <h3>${m.title}</h3>
            <p>${m.year} • IMDb: ${m.imdbRating || "N/A"} • ${m.runtime}</p>
            <p class="explain-string">${m.explain}</p>
            ${metricsHtml}
            <button class="review-btn" style="margin-top: 10px;">Add/Edit Review</button>
          </div>`;
                card.querySelector(".review-btn").addEventListener("click", () => this.openModal(m));
                this.elements.decisionResults.appendChild(card);
            });
        });

        ["pa-1", "pa-2", "pa-3", "pb-1", "pb-2", "pb-3", "search-input"].forEach(id => {
            const el = document.getElementById(id);
            if (el) this.bindAutocomplete(el);
        });

        window.onclick = e => {
            if (e.target === this.elements.modal) this.closeReviewModal();
            if (e.target === this.elements.decisionModal) {
                this.elements.decisionModal.classList.remove("active");
                setTimeout(() => {
                    this.elements.decisionModal.style.display = "none";
                }, 400);
            }
        };
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
                        div.textContent = `${m.Title} (${m.Year})`;
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
        this.showSpinner();

        const { store } = await import('./store.js');
        store.saveRecentSearch(query);
        this.loadRecent();

        let results = [];
        const isTagSearch = query.toLowerCase().startsWith('scene:');

        if (isTagSearch) {
            const tagQuery = query.toLowerCase().replace('scene:', '').trim();
            // Filter from allMovies based on tags
            const allMovies = store.getAllMovies();
            const allTags = store.getAllTags();
            results = allMovies.filter(m => {
                const mTags = allTags[m.id] || [];
                return mTags.some(t => t.includes(tagQuery));
            });
        } else {
            results = await api.searchMovies(query);
        }

        if (results && results.length > 0) {
            const detailedMovies = isTagSearch
                ? results // already details if fetched from store
                : await Promise.all(results.map(m => api.fetchMovieById(m.imdbID || m.id)));

            const validDetailed = detailedMovies.filter(Boolean);
            if (!isTagSearch && validDetailed.length > 0) {
                const { store } = await import('./store.js');
                store.saveMoviesBatch(validDetailed);
            }
            this.renderMovies(validDetailed);
        } else {
            this.elements.movieResults.innerHTML = "<p>No movies found.</p>";
        }
    },

    renderMovies(movies) {
        this.elements.movieResults.innerHTML = "";

        const cards = [];

        movies.forEach(m => {
            const metricsHtml = m.metrics ? `
              <div class="metrics-container">
                <div class="metric-row">
                  <span class="metric-label">Emotional</span>
                  <div class="metric-bar"><div class="metric-fill emotional" style="width: ${m.metrics.emotionalIntensity}%"></div></div>
                  <span class="metric-value">${m.metrics.emotionalIntensity}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Cognitive</span>
                  <div class="metric-bar"><div class="metric-fill cognitive" style="width: ${m.metrics.cognitiveLoad}%"></div></div>
                  <span class="metric-value">${m.metrics.cognitiveLoad}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Comfort</span>
                  <div class="metric-bar"><div class="metric-fill comfort" style="width: ${m.metrics.comfortScore}%"></div></div>
                  <span class="metric-value">${m.metrics.comfortScore}</span>
                </div>
              </div>
            ` : '';

            const card = document.createElement("div");
            card.className = "movie-card";

            // Initial styling for GSAP to animate from
            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                card.style.opacity = "0";
                card.style.transform = "translateY(30px)";
            }

            // Robust Poster URL Logic
            const fallback = "https://placehold.co/300x450/111/555?text=No+Poster";
            const posterUrl = (m.Poster && m.Poster !== "N/A") ? m.Poster : (m.poster && m.poster !== "N/A") ? m.poster : fallback;

            card.innerHTML = `
              <img src="${posterUrl}" alt="${m.Title || m.title}" onerror="this.src='${fallback}'">
              <div class="card-overlay" style="z-index: 2;">
                <div class="movie-info" style="pointer-events: none;">
                  <h3>${m.Title || m.title}</h3>
                  <p>${m.Year || m.year} • IMDb: ${m.imdbRating || "N/A"}</p>
                  <p class="plot-text" style="font-size: 0.85rem; margin-top: 5px; opacity: 0.8; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${m.plot || m.Plot || m.genres || "No description."}</p>
                  ${metricsHtml}
                  <button class="review-btn" data-action="open-modal" data-id="${m.imdbID || m.id}" style="pointer-events: auto; position: relative; z-index: 10;"><i class="fas fa-plus"></i> Watchlist / Review</button>
                </div>
              </div>`;

            // Give the card an identifier to fetch the movie object during delegation
            card.dataset.id = m.imdbID || m.id;

            // Temporary store to easily map dataset ID to object
            if (!this.state.renderedMoviesMap) this.state.renderedMoviesMap = {};
            this.state.renderedMoviesMap[m.imdbID || m.id] = m;

            this.elements.movieResults.appendChild(card);
            cards.push(card);
        });

        // Event Delegation Pattern for robustness
        this.elements.movieResults.onclick = (e) => {
            const btn = e.target.closest('.review-btn');
            const card = e.target.closest('.movie-card');

            if (btn && btn.dataset.action === "open-modal") {
                const movieId = btn.dataset.id;
                const movie = this.state.renderedMoviesMap[movieId];
                const posterImg = btn.closest('.movie-card').querySelector('img');
                if (movie) this.openModal(movie, posterImg);
                return;
            }

            if (card) {
                const movieId = card.dataset.id;
                const movie = this.state.renderedMoviesMap[movieId];
                const posterImg = card.querySelector('img');
                if (movie) this.openModal(movie, posterImg);
            }
        };

        // GSAP ScrollTrigger Batch Animation
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

    async openModal(movie, sourceImgElement = null) {
        this.state.currentMovie = movie;
        this.elements.modalTitle.textContent = movie.Title || movie.title;
        const fallback = "https://placehold.co/300x450/111/555?text=No+Poster";
        const posterUrl = (movie.Poster && movie.Poster !== "N/A") ? movie.Poster : (movie.poster && movie.poster !== "N/A") ? movie.poster : fallback;
        this.elements.modalPoster.src = posterUrl;
        this.elements.modalPoster.onerror = function () { this.src = fallback; };

        this.elements.modalPlot.textContent = movie.plot || movie.Plot || "No plot summary available.";

        this.setupCarousel(movie);

        const { store } = await import('./store.js');
        const saved = store.getReviews().find(r => r.id === (movie.imdbID || movie.id));
        this.state.selectedRating = saved ? saved.rating : 0;
        this.elements.reviewText.value = saved ? saved.text : "";
        this.elements.charCount.textContent = this.elements.reviewText.value.length + "/300";

        // Update Watch Now link
        if (movie.watchLink) {
            this.elements.watchNowBtn.href = movie.watchLink;
        } else {
            const movieTitle = movie.Title || movie.title;
            this.elements.watchNowBtn.href = `https://www.google.com/search?q=where+to+watch+${encodeURIComponent(movieTitle)}+movie+online`;
        }

        // Watchlist state
        const wl = store.getWatchlist().find(m => m.id === (movie.imdbID || movie.id));
        if (wl) {
            this.elements.watchlistBtn.innerHTML = '<i class="fas fa-check"></i> In Watchlist';
            this.elements.watchlistBtn.style.background = '#27ae60';
        } else {
            this.elements.watchlistBtn.innerHTML = '<i class="fas fa-bookmark"></i> Watchlist';
            this.elements.watchlistBtn.style.background = '#34495e';
        }

        this.elements.newTagInput.value = "";
        this.renderTags();
        this.renderStars();

        this.elements.modal.style.display = "flex";
        setTimeout(() => this.elements.modal.classList.add("active"), 10);
    },

    setupCarousel(movie) {
        const scenes = movie.scenes && movie.scenes.length > 0 ? movie.scenes : [];

        this.elements.carouselTrack.innerHTML = '';
        this.elements.carouselDots.innerHTML = '';

        if (scenes.length === 0) {
            this.elements.modalCarousel.style.display = 'none';
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
        this.state.totalSlides = mockScenes.length;
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
        if (!this.state.currentMovie) return;
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
            star.onclick = () => {
                this.state.selectedRating = i;
                this.renderStars();
            };
            this.elements.starContainer.appendChild(star);
        }
    },

    async saveReview() {
        if (!this.state.currentMovie) return;
        const newReview = {
            id: this.state.currentMovie.imdbID || this.state.currentMovie.id,
            title: this.state.currentMovie.Title || this.state.currentMovie.title,
            rating: this.state.selectedRating,
            text: this.elements.reviewText.value,
            date: new Date().toLocaleDateString()
        };
        const { store } = await import('./store.js');
        store.saveReview(newReview);
        store.saveMoviesBatch([this.state.currentMovie]);

        this.closeReviewModal();
        if (document.getElementById("reviews").classList.contains("active")) {
            this.loadUserReviews();
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
        const reviews = store.getReviews();
        this.elements.reviewsList.innerHTML = reviews.length ? "" : "<p>No reviews yet.</p>";

        const spoilerTokens = ['ending', 'twist is', 'spoiler', 'dies', 'the killer is'];

        reviews.forEach(r => {
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

            div.innerHTML = `
            <div class="review-header">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${r.id}" alt="Avatar" class="user-avatar">
                <div class="user-info">
                    <h3>${r.title}</h3>
                    <span class="review-meta">${r.date} • <span class="review-stars">${starsHtml}</span></span>
                </div>
            </div>
            <div class="review-content">
                ${reviewHtml}
            </div>
            <div class="review-actions">
                <button class="edit ripple-btn"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete ripple-btn"><i class="fas fa-trash"></i> Delete</button>
            </div>`;
            div.querySelector(".edit").onclick = async () => {
                const movie = await api.fetchMovieById(r.id);
                if (movie) this.openModal(movie);
            };
            div.querySelector(".delete").onclick = () => {
                store.removeReview(r.id);
                this.loadUserReviews();
            };
            this.elements.reviewsList.appendChild(div);
        });

        // GSAP Staggered Entry for Review Cards
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && reviews.length > 0) {
            const premiumCards = document.querySelectorAll('#reviews .premium-card');
            gsap.fromTo(premiumCards,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: "#reviews",
                        start: "top 80%"
                    }
                }
            );
        }
    },

    async loadRecent() {
        const { store } = await import('./store.js');
        const list = store.getRecentSearches();
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

    async loadHiddenGems() {
        const container = this.elements.hiddenGemsList;
        container.innerHTML = `
            <div style="grid-column: 1 / -1; width: 100%; text-align: center; padding: 60px 20px;">
                <i class="fas fa-gem fa-spin" style="font-size: 3rem; color: var(--accent-secondary); margin-bottom: 20px; filter: drop-shadow(0 0 10px rgba(0,229,255,0.5));"></i>
                <h3 style="color: #fff; margin-bottom: 10px;">Mining Hidden Gems...</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Please wait while we analyze movie data to find high-rated gems with low popularity.</p>
            </div>
        `;
        const { store } = await import('./store.js');
        const gems = await store.getHiddenGems();

        container.innerHTML = gems.length ? "" : "<p style='grid-column: 1 / -1; width: 100%; text-align: center;'>No hidden gems found yet. Try searching for more movies to populate the local cache.</p>";

        // Remove .movie-grid from index.html manually next, we create it dynamically here or we just apply it to the container instead
        container.classList.add("movie-grid"); // Just to be safe if it was missing
        gems.forEach(m => {
            const card = document.createElement("div");
            card.className = "movie-card";
            const fallback = "https://placehold.co/300x450/111/555?text=No+Poster";
            const cover = (m.Poster && m.Poster !== "N/A") ? m.Poster : (m.poster && m.poster !== "N/A") ? m.poster : fallback;
            card.innerHTML = `
              <img src="${cover}" alt="${m.title || m.Title}" onerror="this.src='${fallback}'">
              <div class="card-overlay" style="z-index: 2;">
                <div class="movie-info" style="pointer-events: none;">
                  <h3>${m.title || m.Title}</h3>
                  <p>${m.year || m.Year} • IMDb: ${m.imdbRating || "N/A"}</p>
                  <div class="gems-highlight">
                    <span>💎 Hidden Score: ${parseFloat(m.hiddenScore).toFixed(2)}</span>
                    <p style="margin:4px 0;">IMDb: ${m.imdbRating} | Votes: ${m.imdbVotes}</p>
                    <p class="explain-string">High rating, low votes.</p>
                  </div>
                  <button class="review-btn" data-action="open-modal" data-id="${m.imdbID || m.id}" style="pointer-events: auto; position: relative; z-index: 10;"><i class="fas fa-plus"></i> Watchlist / Review</button>
                </div>
              </div>`;

            card.dataset.id = m.imdbID || m.id;
            if (!this.state.renderedGemsMap) this.state.renderedGemsMap = {};
            this.state.renderedGemsMap[m.imdbID || m.id] = m;

            this.elements.hiddenGemsList.appendChild(card);
        });

        this.elements.hiddenGemsList.onclick = (e) => {
            const btn = e.target.closest('.review-btn');
            const card = e.target.closest('.movie-card');

            if (btn && btn.dataset.action === "open-modal") {
                const movieId = btn.dataset.id;
                const movie = this.state.renderedGemsMap[movieId];
                const posterImg = btn.closest('.movie-card').querySelector('img');
                if (movie) this.openModal(movie, posterImg);
                return;
            }

            if (card) {
                const movieId = card.dataset.id;
                const movie = this.state.renderedGemsMap[movieId];
                const posterImg = card.querySelector('img');
                if (movie) this.openModal(movie, posterImg);
            }
        };

        // GSAP Stagger Animation for Hidden Gems
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && gems.length > 0) {
            const cards = this.elements.hiddenGemsList.querySelectorAll('.movie-card');
            gsap.fromTo(cards,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: "#hidden-gems",
                        start: "top 80%"
                    }
                }
            );
        }
    },

    async loadCinemaDNA() {
        const { store, computeUserAnalytics } = await import('./store.js');
        const analytics = store.computeUserAnalytics();
        if (!analytics || analytics.totalMoviesSaved === 0) {
            const dnaGenre = document.getElementById("dna-genre");
            const dnaRuntime = document.getElementById("dna-runtime");
            const dnaTotalTime = document.getElementById("dna-total-time");

            if (dnaGenre) dnaGenre.textContent = "N/A";
            if (dnaRuntime) dnaRuntime.textContent = "0 mins";
            if (dnaTotalTime) dnaTotalTime.textContent = "0h 0m";
            this.elements.cinemadnaList.innerHTML = "<li>No movies saved yet. Write some reviews!</li>";
            this.drawDNAChart({});
            return;
        }

        const dnaGenre = document.getElementById("dna-genre");
        const dnaRuntime = document.getElementById("dna-runtime");
        const dnaTotalTime = document.getElementById("dna-total-time");

        if (dnaGenre) dnaGenre.textContent = analytics.favoriteGenre;
        if (dnaRuntime) dnaRuntime.textContent = `${analytics.avgRuntime} mins`;
        if (dnaTotalTime) dnaTotalTime.textContent = analytics.totalWatchTimeString;

        this.elements.cinemadnaList.innerHTML = "";
        analytics.top5Directors.forEach(d => {
            const li = document.createElement("li");
            li.textContent = d;
            li.style.background = "var(--bg-dark)";
            li.style.border = "1px solid var(--border-light)";
            li.style.color = "var(--text-light)";
            li.style.padding = "6px 14px";
            li.style.borderRadius = "20px";
            li.style.fontSize = "0.85rem";
            li.style.fontFamily = "var(--font-heading)";
            this.elements.cinemadnaList.appendChild(li);
        });

        // We'll hijack drawDNAChart to draw a sparkline of mood/genres if desired, 
        // or just draw a simple bar chart of genres for now with the new palette.
        this.drawDNAChart(analytics.genreCounts);
        this.state.latestDNA = analytics;
    },

    drawDNAChart(genreCounts) {
        const canvas = document.getElementById("dna-chart");
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // We use genreCounts just to generate some fake volatility for the sparkline trend
        const entries = Object.values(genreCounts);
        if (entries.length === 0) {
            ctx.fillStyle = '#9ca3af'; // var(--text-muted) fallback
            ctx.font = '14px Inter, sans-serif';
            ctx.fillText("No data to display.", 20, 30);
            return;
        }

        // Generate a smooth sparkline using genre counts to seed the curve points
        const points = [];
        const numPoints = Math.max(10, entries.length * 2);
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

        // Draw the smooth sparkline curve
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 0; i < points.length - 1; i++) {
            const xMid = (points[i].x + points[i + 1].x) / 2;
            const yMid = (points[i].y + points[i + 1].y) / 2;
            const cpX1 = (xMid + points[i].x) / 2;
            const cpX2 = (xMid + points[i + 1].x) / 2;
            ctx.quadraticCurveTo(cpX1, points[i].y, xMid, yMid);
            ctx.quadraticCurveTo(cpX2, points[i + 1].y, points[i + 1].x, points[i + 1].y);
        }

        ctx.strokeStyle = '#3b82f6'; // var(--accent-primary)
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Add a subtle gradient fill under the line
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)'); // var(--accent-primary) with opacity
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.fillStyle = gradient;
        ctx.fill();
    },

    generateShareCard(analytics) {
        const canvas = document.getElementById("dna-share-canvas");
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Matte Background
        ctx.fillStyle = '#181a20'; // var(--bg-card)
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header
        ctx.fillStyle = '#3b82f6'; // var(--accent-primary)
        ctx.font = 'bold 50px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("CinemaDNA", canvas.width / 2, 100);

        ctx.fillStyle = '#9ca3af'; // var(--text-muted)
        ctx.font = '24px Inter, sans-serif';
        ctx.fillText("My Emotional Movie Profile", canvas.width / 2, 150);

        // Divider
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(100, 200);
        ctx.lineTo(700, 200);
        ctx.stroke();

        ctx.textAlign = 'left';

        // Draw Row Helper
        const drawRow = (label, val, y, color) => {
            ctx.fillStyle = '#9ca3af';
            ctx.font = '28px Inter, sans-serif';
            ctx.fillText(label, 120, y);

            ctx.fillStyle = color;
            ctx.font = 'bold 36px Poppins, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(val, 680, y + 5);
            ctx.textAlign = 'left';
        };

        // Key Stats
        drawRow("Top Genre", analytics.favoriteGenre, 300, "#10b981"); // accent-tertiary
        drawRow("Avg Runtime", analytics.avgRuntime + " min", 390, "#3b82f6"); // accent-primary
        drawRow("Total Watched", analytics.totalWatchTimeString, 480, "#8b5cf6"); // accent-secondary
        drawRow("Mood Trend", analytics.moodTrend, 570, "#f3f4f6"); // text-light

        // Top Directors Section
        ctx.fillStyle = '#9ca3af';
        ctx.font = '28px Inter, sans-serif';
        ctx.fillText("Top Directors:", 120, 700);

        ctx.fillStyle = '#f3f4f6';
        ctx.font = 'bold 28px Poppins, sans-serif';
        const dirs = analytics.top5Directors.length ? analytics.top5Directors.join(', ') : "None";
        ctx.fillText(dirs.length > 35 ? dirs.substring(0, 32) + "..." : dirs, 120, 750);

        // Footer
        ctx.fillStyle = '#4b5563'; // darker gray
        ctx.font = '20px Inter, monospace';
        ctx.textAlign = 'center';
        ctx.fillText("Generated by CineSins", canvas.width / 2, 1050);

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
            this.elements.watchlistList.innerHTML = "<p style='grid-column: 1 / -1; width: 100%; text-align: center; color: #aaa;'>Your watchlist is empty.</p>";
            return;
        }

        const cards = [];
        wl.forEach(m => {
            const card = document.createElement("div");
            card.className = "movie-card";
            card.style.opacity = "0";
            card.style.transform = "translateY(30px)";

            const fallback = "https://placehold.co/300x450/111/555?text=No+Poster";
            const posterUrl = m.poster || m.Poster || fallback;

            card.innerHTML = `
              <img src="${posterUrl}" alt="${m.title || m.Title}" onerror="this.src='${fallback}'">
              <div class="card-overlay" style="z-index: 2;">
                <div class="movie-info" style="pointer-events: none;">
                  <h3>${m.title || m.Title}</h3>
                  <p>${m.year || m.Year}</p>
                  <button class="review-btn" data-action="remove-watchlist" data-id="${m.imdbID || m.id}" style="pointer-events: auto; background: #e74c3c; position: relative; z-index: 10;"><i class="fas fa-trash"></i> Remove</button>
                </div>
              </div>`;

            card.dataset.id = m.imdbID || m.id;
            if (!this.state.renderedWatchlistMap) this.state.renderedWatchlistMap = {};
            this.state.renderedWatchlistMap[m.imdbID || m.id] = m;

            this.elements.watchlistList.appendChild(card);
            cards.push(card);
        });

        this.elements.watchlistList.onclick = (e) => {
            const btn = e.target.closest('.review-btn');
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
        const popularMovies = [
            "Breaking Bad", "The Shawshank Redemption", "The Godfather",
            "The Dark Knight", "Inception", "Forrest Gump"
        ];

        const detailedMovies = await Promise.all(
            popularMovies.map(title => api.fetchMovieByTitle(title))
        );
        const validMovies = detailedMovies.filter(Boolean);

        const { store } = await import('./store.js');
        store.saveMoviesBatch(validMovies);

        this.renderMovies(validMovies);
    }
};
