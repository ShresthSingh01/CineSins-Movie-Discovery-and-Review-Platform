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
            movieResults: document.getElementById("movie-results"),
            recentList: document.getElementById("recent-list"),
            reviewsList: document.getElementById("reviews-list"),
            modal: document.getElementById("review-modal"),
            closeModal: document.getElementById("close-modal"),
            modalTitle: document.getElementById("modal-title"),
            modalPoster: document.getElementById("modal-poster"),
            starContainer: document.getElementById("star-container"),
            reviewText: document.getElementById("review-text"),
            charCount: document.getElementById("char-count"),
            saveBtn: document.getElementById("save-review")
        };

        this.setupNavigation();
        this.setupEventListeners();
        this.loadRecent();
        this.loadInitialMovies();
    },

    setupNavigation() {
        document.querySelectorAll("nav a").forEach(link => {
            link.addEventListener("click", e => {
                e.preventDefault();
                document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
                link.classList.add("active");
                document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active"));
                document.getElementById(link.dataset.section).classList.add("active");
                if (link.dataset.section === "reviews") this.loadUserReviews();
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
        window.onclick = e => {
            if (e.target === this.elements.modal) this.closeReviewModal();
        };
    },

    async searchMovies() {
        const query = this.elements.searchInput.value.trim();
        if (!query) return;
        this.showSpinner();
        store.saveRecentSearch(query);
        this.loadRecent();

        const results = await api.searchMovies(query);
        if (results && results.length > 0) {
            const detailedMovies = await Promise.all(
                results.map(m => api.fetchMovieById(m.imdbID))
            );
            this.renderMovies(detailedMovies.filter(Boolean));
        } else {
            this.elements.movieResults.innerHTML = "<p>No movies found.</p>";
        }
    },

    renderMovies(movies) {
        this.elements.movieResults.innerHTML = "";
        movies.forEach(m => {
            const card = document.createElement("div");
            card.className = "movie-card";
            card.innerHTML = `
        <img src="${m.Poster !== "N/A" ? m.Poster : "https://via.placeholder.com/300x450"}" alt="">
        <div class="movie-info">
          <h3>${m.Title}</h3>
          <p>${m.Year} • IMDb: ${m.imdbRating || "N/A"}</p>
          <p>${m.Plot || "No description."}</p>
          <button class="review-btn">Add/Edit Review</button>
        </div>`;
            card.querySelector(".review-btn").addEventListener("click", () => this.openModal(m));
            this.elements.movieResults.appendChild(card);
        });
    },

    openModal(movie) {
        this.state.currentMovie = movie;
        this.elements.modalTitle.textContent = movie.Title;
        this.elements.modalPoster.src = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/100";

        const saved = store.getReviews().find(r => r.id === movie.imdbID);
        this.state.selectedRating = saved ? saved.rating : 0;
        this.elements.reviewText.value = saved ? saved.text : "";
        this.elements.charCount.textContent = this.elements.reviewText.value.length + "/300";

        this.renderStars();
        this.elements.modal.style.display = "block";
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
