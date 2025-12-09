const API_KEY = "5dddf095";

// Elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const movieResults = document.getElementById("movie-results");
const recentList = document.getElementById("recent-list");
const reviewsList = document.getElementById("reviews-list");

// Modal
const modal = document.getElementById("review-modal");
const closeModal = document.getElementById("close-modal");
const modalTitle = document.getElementById("modal-title");
const modalPoster = document.getElementById("modal-poster");
const starContainer = document.getElementById("star-container");
const reviewText = document.getElementById("review-text");
const charCount = document.getElementById("char-count");
const saveBtn = document.getElementById("save-review");

let currentMovie = null;
let selectedRating = 0;

// Navigation
document.querySelectorAll("nav a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
    link.classList.add("active");
    document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active"));
    document.getElementById(link.dataset.section).classList.add("active");
    if (link.dataset.section === "reviews") loadUserReviews();
  });
});

// Search movies
function searchMovies() {
  const query = searchInput.value.trim();
  if (!query) return;
  showSpinner();
  saveRecentSearch(query);
  fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`)
    .then(res => res.json())
    .then(data => {
      if (data.Response === "True") {
        Promise.all(data.Search.map(m => fetchMovie(m.imdbID)))
          .then(movies => renderMovies(movies.filter(Boolean)));
      } else {
        movieResults.innerHTML = "<p>No movies found.</p>";
      }
    });
}

function fetchMovie(id) {
  return fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}`)
    .then(res => res.json())
    .then(d => (d.Response === "True" ? d : null));
}

function renderMovies(movies) {
  movieResults.innerHTML = "";
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
    card.querySelector(".review-btn").addEventListener("click", () => openModal(m));
    movieResults.appendChild(card);
  });
}

// Reviews
function openModal(movie) {
  currentMovie = movie;
  modalTitle.textContent = movie.Title;
  modalPoster.src = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/100";
  const saved = getReviews().find(r => r.id === movie.imdbID);
  selectedRating = saved ? saved.rating : 0;
  reviewText.value = saved ? saved.text : "";
  charCount.textContent = reviewText.value.length + "/300";
  renderStars();
  modal.style.display = "block";
}
function closeReviewModal() { modal.style.display = "none"; }

function renderStars() {
  starContainer.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.textContent = "★";
    star.className = i <= selectedRating ? "star active" : "star";
    star.onclick = () => { selectedRating = i; renderStars(); };
    starContainer.appendChild(star);
  }
}

function saveReview() {
  if (!currentMovie) return;
  const reviews = getReviews();
  const newReview = { id: currentMovie.imdbID, title: currentMovie.Title, rating: selectedRating, text: reviewText.value, date: new Date().toLocaleDateString() };
  const index = reviews.findIndex(r => r.id === currentMovie.imdbID);
  if (index > -1) reviews[index] = newReview; else reviews.push(newReview);
  localStorage.setItem("reviews", JSON.stringify(reviews));
  closeReviewModal();
  if (document.getElementById("reviews").classList.contains("active")) loadUserReviews();
}

function loadUserReviews() {
  const reviews = getReviews();
  reviewsList.innerHTML = reviews.length ? "" : "<p>No reviews yet.</p>";
  reviews.forEach(r => {
    const div = document.createElement("div");
    div.className = "review-card";
    div.innerHTML = `
      <div><h3>${r.title}</h3><span>${r.date}</span></div>
      <div>${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
      <p>${r.text}</p>
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>`;
    div.querySelector(".edit").onclick = () => fetchMovie(r.id).then(openModal);
    div.querySelector(".delete").onclick = () => { removeReview(r.id); loadUserReviews(); };
    reviewsList.appendChild(div);
  });
}
function getReviews() { return JSON.parse(localStorage.getItem("reviews")) || []; }
function removeReview(id) {
  localStorage.setItem("reviews", JSON.stringify(getReviews().filter(r => r.id !== id)));
}

// Recent Searches
function saveRecentSearch(q) {
  let list = JSON.parse(localStorage.getItem("recent")) || [];
  list = [q, ...list.filter(x => x !== q)].slice(0, 5);
  localStorage.setItem("recent", JSON.stringify(list));
  loadRecent();
}
function loadRecent() {
  const list = JSON.parse(localStorage.getItem("recent")) || [];
  recentList.innerHTML = "";
  list.forEach(q => {
    const li = document.createElement("li");
    li.textContent = q;
    li.onclick = () => { searchInput.value = q; searchMovies(); };
    recentList.appendChild(li);
  });
}

// Spinner
function showSpinner() { movieResults.innerHTML = '<div class="spinner"></div>'; }


searchBtn.onclick = searchMovies;
searchInput.addEventListener("keypress", e => { if (e.key === "Enter") searchMovies(); });
reviewText.oninput = () => charCount.textContent = reviewText.value.length + "/300";
closeModal.onclick = closeReviewModal;
saveBtn.onclick = saveReview;
window.onclick = e => { if (e.target === modal) closeReviewModal(); };

loadRecent();

const popularMovies = ["Breaking Bad",
  "The Shawshank Redemption",
  "The Godfather",
  "The Dark Knight",
  "Inception",
  "Forrest Gump"
];

function loadInitialMovies() {
  showSpinner();
  Promise.all(popularMovies.map(title =>
    fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(title)}`)
      .then(res => res.json())
      .then(data => (data.Response === "True" ? data : null))
  )).then(movies => renderMovies(movies.filter(Boolean)));
}

// Run when page loads
window.onload = () => {
  loadInitialMovies();
  loadRecent();
};
