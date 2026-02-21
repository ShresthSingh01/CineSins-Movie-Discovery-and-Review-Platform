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
            importFile: document.getElementById("import-file")
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
            this.renderMovies(detailedMovies.filter(Boolean));
        } else {
            this.elements.movieResults.innerHTML = "<p>No movies found.</p>";
        }
    },

    renderMovies(movies) {
        this.elements.movieResults.innerHTML = "";
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
            card.innerHTML = `
        <img src="${m.Poster !== "N/A" ? m.Poster : "https://via.placeholder.com/300x450"}" alt="">
        <div class="movie-info">
          <h3>${m.Title || m.title}</h3>
          <p>${m.Year || m.year} • IMDb: ${m.imdbRating || "N/A"}</p>
          <p>${m.Plot ? m.Plot : m.genres || "No description."}</p>
          ${metricsHtml}
          <button class="review-btn">Add/Edit Review</button>
        </div>`;
            card.querySelector(".review-btn").addEventListener("click", () => this.openModal(m));
            this.elements.movieResults.appendChild(card);
        });
    },

    async openModal(movie) {
        this.state.currentMovie = movie;
        this.elements.modalTitle.textContent = movie.Title || movie.title;
        this.elements.modalPoster.src = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/100";

        const { store } = await import('./store.js');
        const saved = store.getReviews().find(r => r.id === (movie.imdbID || movie.id));
        this.state.selectedRating = saved ? saved.rating : 0;
        this.elements.reviewText.value = saved ? saved.text : "";
        this.elements.charCount.textContent = this.elements.reviewText.value.length + "/300";

        this.elements.newTagInput.value = "";
        this.renderTags();
        this.renderStars();
        this.elements.modal.style.display = "flex";
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
        this.elements.modal.style.display = "none";
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
        reviews.forEach(r => {
            const div = document.createElement("div");
            div.className = "review-card";
            div.innerHTML = `
        <div><h3>${r.title}</h3><span>${r.date}</span></div>
        <div>${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
        <p>${r.text}</p>
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>`;
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
    },

    loadRecent() {
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

    loadRecent() {
        const { store } = require('./store.js'); // Use dynamic import or keep it global if already loaded. We will handle dynamic in logic below.
    },

    // We overwrite dynamic require directly.
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
        const { store } = await import('./store.js');
        const gems = store.getHiddenGems();
        this.elements.hiddenGemsList.innerHTML = gems.length ? "" : "<p>No hidden gems found yet. Try searching for more movies to populate the local cache.</p>";
        gems.forEach(m => {
            const card = document.createElement("div");
            card.className = "movie-card";
            const cover = m.Poster !== "N/A" && m.Poster ? m.Poster : m.poster && m.poster !== "N/A" ? m.poster : "https://via.placeholder.com/300x450";
            card.innerHTML = `
          <img src="${cover}" alt="">
          <div class="movie-info">
            <h3>${m.title || m.Title}</h3>
            <p>${m.year || m.Year} • IMDb: ${m.imdbRating || "N/A"}</p>
            <div class="gems-highlight">
              <span>💎 Hidden Score: ${parseFloat(m.hiddenScore).toFixed(2)}</span>
              <p style="margin:4px 0;">IMDb: ${m.imdbRating} | Votes: ${m.imdbVotes}</p>
              <p class="explain-string">High rating, low votes.</p>
            </div>
            <button class="review-btn" style="margin-top:auto">Add/Edit Review</button>
          </div>`;
            card.querySelector(".review-btn").addEventListener("click", () => Object.getPrototypeOf(this).openModal.call(this, m));
            this.elements.hiddenGemsList.appendChild(card);
        });
    },

    showSpinner() {
        this.elements.movieResults.innerHTML = '<div class="spinner"></div>';
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
