import { api } from './api.js';
import { store } from './store.js';

export const ui = {
    elements: {},
    state: {
        currentMovie: null,
        selectedRating: 0
    },

    init() {
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
            hiddenGemsList: document.getElementById("hidden-gems-list"),
            cinemadnaList: document.getElementById("dna-directors"),
            dnaGenre: document.getElementById("dna-genre"),
            dnaRuntime: document.getElementById("dna-runtime"),
            dnaMood: document.getElementById("dna-mood"),
            dnaWatchtime: document.getElementById("dna-watchtime"),
            dnaChart: document.getElementById("dna-chart"),
            generateShareBtn: document.getElementById("generate-share-btn"),
            dnaShareCanvas: document.getElementById("dna-share-canvas"),
            modal: document.getElementById("review-modal"),
            closeModal: document.getElementById("close-modal"),
            modalTitle: document.getElementById("modal-title"),
            modalPoster: document.getElementById("modal-poster"),
            modalTags: document.getElementById("modal-tags"),
            newTagInput: document.getElementById("new-tag-input"),
            addTagBtn: document.getElementById("add-tag-btn"),
            starContainer: document.getElementById("star-container"),
            reviewText: document.getElementById("review-text"),
            charCount: document.getElementById("char-count"),
            saveBtn: document.getElementById("save-review"),
            importTagsBtn: document.getElementById("import-tags-btn"),
            exportTagsBtn: document.getElementById("export-tags-btn"),
            importFile: document.getElementById("import-file"),
            calcCompatBtn: document.getElementById("calc-compat-btn"),
            compatResults: document.getElementById("compat-results"),
            compatScore: document.getElementById("compat-score"),
            compatGenres: document.getElementById("compat-genres"),
            compatMoviesList: document.getElementById("compat-movies-list"),
            compatJson: document.getElementById("compat-json")
        };

        this.setupNavigation();
        this.setupEventListeners();
        this.loadRecent();
        this.loadInitialMovies();
    },

    setupNavigation() {
        document.querySelectorAll("nav a[data-section]").forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();
                document.querySelectorAll("nav a[data-section]").forEach(a => a.classList.remove("active"));
                link.classList.add("active");
                document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active"));
                document.getElementById(link.dataset.section).classList.add("active");
                if (link.dataset.section === "reviews") this.loadUserReviews();
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

                const { store } = await import('./store.js');
                // Pre-seed if needed before calling compatibility
                if (store.getAllMovies().length < 50) {
                    await store.seedMoviesIfNeeded();
                }

                const storeCompatResult = store.computeCompatibility([...moviesA], [...moviesB]);

                this.elements.compatScore.textContent = storeCompatResult.percentage;
                this.elements.compatGenres.textContent = storeCompatResult.commonGenres.length ? storeCompatResult.commonGenres.join(', ') : "None";
                this.elements.compatJson.value = storeCompatResult.jsonString;

                this.elements.compatMoviesList.innerHTML = storeCompatResult.suggestedMovies.length ? "" : "<p>No suggestions found.</p>";
                storeCompatResult.suggestedMovies.forEach(m => {
                    const card = document.createElement("div");
                    card.className = "movie-card";
                    const fallback = "https://placehold.co/300x450/111/555?text=No+Poster";
                    const cover = (m.Poster && m.Poster !== "N/A") ? m.Poster : (m.poster && m.poster !== "N/A") ? m.poster : fallback;
                    card.innerHTML = `
            <img src="${cover}" alt="" onerror="this.src='${fallback}'">
            <div class="movie-info">
              <h3>${m.title || m.Title}</h3>
              <p>${m.year || m.Year} • IMDb: ${m.imdbRating || "N/A"}</p>
              <div class="metrics-container" style="background: rgba(52, 152, 219, 0.2); border-left: 3px solid #3498db;">
                <p class="explain-string" style="color: #fff; margin-top: 0;">Perfect Joint Pick</p>
              </div>
              <button class="review-btn" style="margin-top:auto">View Details</button>
            </div>`;
                    card.querySelector(".review-btn").addEventListener("click", () => this.openModal(m));
                    this.elements.compatMoviesList.appendChild(card);
                });

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
        this.elements.decisionBtn.onclick = () => {
            this.elements.decisionModal.style.display = "flex";
            this.elements.decisionResults.innerHTML = "";
        };
        this.elements.closeDecisionModal.onclick = () => {
            this.elements.decisionModal.style.display = "none";
        };
        this.elements.getRecommendationsBtn.onclick = async () => {
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
                card.querySelector(".review-btn").addEventListener("click", () => Object.getPrototypeOf(this).openModal.call(this, m));
                this.elements.decisionResults.appendChild(card);
            });
        };

        window.onclick = e => {
            if (e.target === this.elements.modal) this.closeReviewModal();
            if (e.target === this.elements.decisionModal) this.elements.decisionModal.style.display = "none";
        };
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
            card.style.opacity = "0";
            card.style.transform = "translateY(30px)";

            // Robust Poster URL Logic
            const fallback = "https://placehold.co/300x450/111/555?text=No+Poster";
            const posterUrl = (m.Poster && m.Poster !== "N/A") ? m.Poster : (m.poster && m.poster !== "N/A") ? m.poster : fallback;

            card.innerHTML = `
              <img src="${posterUrl}" alt="${m.Title || m.title}" onerror="this.src='${fallback}'">
              <div class="card-overlay" style="pointer-events: none;">
                <div class="movie-info">
                  <h3>${m.Title || m.title}</h3>
                  <p>${m.Year || m.year} • IMDb: ${m.imdbRating || "N/A"}</p>
                  <p class="plot-text">${m.Plot ? m.Plot : m.genres || "No description."}</p>
                  ${metricsHtml}
                  <button class="review-btn" style="pointer-events: auto;"><i class="fas fa-plus"></i> Watchlist / Review</button>
                </div>
              </div>`;
            const posterImg = card.querySelector("img");
            card.querySelector(".review-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                this.openModal(m, posterImg);
            });
            card.addEventListener("click", () => this.openModal(m, posterImg));
            this.elements.movieResults.appendChild(card);
            cards.push(card);
        });

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

        const { store } = await import('./store.js');
        const saved = store.getReviews().find(r => r.id === (movie.imdbID || movie.id));
        this.state.selectedRating = saved ? saved.rating : 0;
        this.elements.reviewText.value = saved ? saved.text : "";
        this.elements.charCount.textContent = this.elements.reviewText.value.length + "/300";

        this.elements.newTagInput.value = "";
        this.renderTags();
        this.renderStars();

        this.elements.modal.style.display = "flex";

        // FLIP Animation Logic
        if (sourceImgElement && this.elements.modalPoster) {
            // 1. FIRST: Get initial state
            const first = sourceImgElement.getBoundingClientRect();
            this.state.lastSourceImg = sourceImgElement; // Save for closing

            // Force layout calculation
            const modalContent = document.querySelector('.modal-content');
            modalContent.style.opacity = '0'; // Hide content initially to only show poster flying

            requestAnimationFrame(() => {
                // 2. LAST: Get final state
                const last = this.elements.modalPoster.getBoundingClientRect();

                // 3. INVERT: Calculate translation and scale
                const deltaX = first.left - last.left;
                const deltaY = first.top - last.top;
                const deltaW = first.width / last.width;
                const deltaH = first.height / last.height;

                // Apply inverted transform instantly
                this.elements.modalPoster.style.transformOrigin = 'top left';
                this.elements.modalPoster.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
                this.elements.modalPoster.style.transition = 'none';

                requestAnimationFrame(() => {
                    // 4. PLAY: Animate to final state
                    this.elements.modalPoster.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
                    this.elements.modalPoster.style.transform = 'none';

                    // Fade in rest of modal content slightly after
                    setTimeout(() => {
                        modalContent.style.transition = 'opacity 0.4s ease';
                        modalContent.style.opacity = '1';
                    }, 100);
                });
            });
        } else {
            // Fallback if no source image
            document.querySelector('.modal-content').style.opacity = '1';
        }
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
        const modalContent = document.querySelector('.modal-content');

        // Reverse FLIP Animation if we have a source image
        if (this.state.lastSourceImg && this.elements.modalPoster) {
            const first = this.elements.modalPoster.getBoundingClientRect();
            const last = this.state.lastSourceImg.getBoundingClientRect();

            const deltaX = last.left - first.left;
            const deltaY = last.top - first.top;
            const deltaW = last.width / first.width;
            const deltaH = last.height / first.height;

            // Fade out modal text first
            modalContent.style.opacity = '0';

            // Animate poster back to grid position
            this.elements.modalPoster.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
            this.elements.modalPoster.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;

            setTimeout(() => {
                this.elements.modal.style.display = "none";
                this.elements.modalPoster.style.transform = 'none'; // reset
                this.elements.modalPoster.style.transition = 'none'; // reset
                this.state.lastSourceImg = null;
            }, 400); // Wait for transition
        } else {
            this.elements.modal.style.display = "none";
        }
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

    saveReview() {
        if (!this.state.currentMovie) return;
        const newReview = {
            id: this.state.currentMovie.imdbID,
            title: this.state.currentMovie.Title,
            rating: this.state.selectedRating,
            text: this.elements.reviewText.value,
            date: new Date().toLocaleDateString()
        };
        store.saveReview(newReview);
        this.closeReviewModal();
        if (document.getElementById("reviews").classList.contains("active")) {
            this.loadUserReviews();
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
          <div class="card-overlay" style="pointer-events: none;">
            <div class="movie-info">
              <h3>${m.title || m.Title}</h3>
              <p>${m.year || m.Year} • IMDb: ${m.imdbRating || "N/A"}</p>
              <div class="gems-highlight">
                <span>💎 Hidden Score: ${parseFloat(m.hiddenScore).toFixed(2)}</span>
                <p style="margin:4px 0;">IMDb: ${m.imdbRating} | Votes: ${m.imdbVotes}</p>
                <p class="explain-string">High rating, low votes.</p>
              </div>
              <button class="review-btn" style="pointer-events: auto;"><i class="fas fa-plus"></i> Add/Edit Review</button>
            </div>
          </div>`;
            card.querySelector(".review-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                Object.getPrototypeOf(this).openModal.call(this, m);
            });
            card.addEventListener("click", () => Object.getPrototypeOf(this).openModal.call(this, m));
            this.elements.hiddenGemsList.appendChild(card);
        });

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
        const { store } = await import('./store.js');
        const analytics = store.computeUserAnalytics();

        if (analytics.totalMoviesSaved === 0) {
            this.elements.dnaGenre.textContent = "N/A";
            this.elements.dnaRuntime.textContent = "0 min";
            this.elements.dnaMood.textContent = "N/A";
            this.elements.dnaWatchtime.textContent = "0h 0m";
            this.elements.cinemadnaList.innerHTML = "<li>No movies saved yet. Write some reviews!</li>";
            this.drawDNAChart({});
            return;
        }

        this.elements.dnaGenre.textContent = analytics.favoriteGenre;
        this.elements.dnaRuntime.textContent = analytics.avgRuntime + " min";
        this.elements.dnaMood.textContent = analytics.moodTrend;

        const hours = Math.floor(analytics.totalRuntimeMins / 60);
        const mins = analytics.totalRuntimeMins % 60;
        this.elements.dnaWatchtime.textContent = `${hours}h ${mins}m`;

        this.elements.cinemadnaList.innerHTML = "";
        analytics.top5Directors.forEach(d => {
            const li = document.createElement("li");
            li.textContent = d;
            li.style.background = "#333";
            li.style.padding = "5px 10px";
            li.style.borderRadius = "20px";
            li.style.fontSize = "0.9rem";
            this.elements.cinemadnaList.appendChild(li);
        });

        this.drawDNAChart(analytics.genreCounts);
        this.state.latestDNA = analytics;
    },

    drawDNAChart(genreCounts) {
        const canvas = this.elements.dnaChart;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const entries = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
        if (entries.length === 0) {
            ctx.fillStyle = '#aaa';
            ctx.font = '16px sans-serif';
            ctx.fillText("No data to display.", 20, 30);
            return;
        }

        const maxCount = entries[0][1] || 1;
        const barHeight = 15;
        const gap = 10;
        const startY = 20;

        ctx.font = '14px sans-serif';
        entries.forEach((entry, i) => {
            const [genre, count] = entry;
            const y = startY + i * (barHeight + gap);

            ctx.fillStyle = '#fff';
            ctx.fillText(genre, 10, y + 12);

            const barWidth = (count / maxCount) * (canvas.width - 200);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(150, y, barWidth, barHeight);

            ctx.fillStyle = '#aaa';
            ctx.fillText(count.toString(), 150 + barWidth + 10, y + 12);
        });
    },

    generateShareCard(analytics) {
        const canvas = this.elements.dnaShareCanvas;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#3498db';
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("My CinemaDNA", canvas.width / 2, 60);

        ctx.fillStyle = '#aaaaaa';
        ctx.font = 'italic 20px sans-serif';
        ctx.fillText("Analyzed by CineSins", canvas.width / 2, 95);

        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, 130);
        ctx.lineTo(550, 130);
        ctx.stroke();

        ctx.textAlign = 'left';

        const drawStat = (label, val, y, color) => {
            ctx.fillStyle = '#888888';
            ctx.font = '24px sans-serif';
            ctx.fillText(label, 70, y);

            ctx.fillStyle = color;
            ctx.font = 'bold 36px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(val, 530, y + 5);
            ctx.textAlign = 'left';
        };

        drawStat("Favorite Genre", analytics.favoriteGenre, 200, "#e74c3c");
        drawStat("Avg Runtime", analytics.avgRuntime + " min", 270, "#3498db");
        drawStat("Mood Trend", analytics.moodTrend, 340, "#2ecc71");

        const hours = Math.floor(analytics.totalRuntimeMins / 60);
        const mins = analytics.totalRuntimeMins % 60;
        drawStat("Total Watch Time", `${hours}h ${mins}m`, 410, "#f1c40f");

        ctx.fillStyle = '#aaaaaa';
        ctx.font = '22px sans-serif';
        ctx.fillText("Top Directors:", 70, 500);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        const dirs = analytics.top5Directors.length ? analytics.top5Directors.join(', ') : "None";
        ctx.fillText(dirs.length > 35 ? dirs.substring(0, 32) + "..." : dirs, 70, 540);

        ctx.fillStyle = '#444444';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("Generated on " + new Date().toLocaleDateString(), canvas.width / 2, 760);

        const link = document.createElement('a');
        link.download = `CinemaDNA_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
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
            popularMovies.map(title => api.fetchRawMovieByTitle(title))
        );
        this.renderMovies(detailedMovies.filter(Boolean));
    }
};
