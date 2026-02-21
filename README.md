
# CineSins

An interactive movie discovery and review web app built with HTML, CSS, and JavaScript.
Users can search movies (via OMDb API), rate them with stars, write reviews, and manage their personal review list stored in localStorage.

## Features

🔍 Search Movies by title using the OMDb API

⭐ Rate Movies with a 5-star rating system

📝 Write & Save Reviews with localStorage (persists even after reload)

✏️ Edit & Delete Reviews anytime

📑 Reviews Page – sorted by latest review date

⏳ Loading Spinner while fetching data

🕑 Recent Searches – last 5 queries stored and clickable

🎨 Modern UI/UX with cinematic theme and smooth animations

📱 Responsive Design – works across desktop & mobile


## Tech Stack

Frontend: HTML, CSS, JavaScript (Vanilla JS)

API: OMDb API
 for movie data

Storage: LocalStorage (for user reviews & search history)

## Development / Run Instructions

1. **Local Server Required**: Because the app uses ES modules (`<script type="module">`), opening `index.html` directly from the filesystem (`file://`) may result in CORS errors depending on your browser.
2. **Start a server**: 
   - You can run `npx serve .` using Node.js
   - Or `python -m http.server 8000` using Python
   - Or use the "Live Server" extension in VS Code.
3. **View the App**: Open your browser at `http://localhost:8000` (or the port specified by your server).
4. **Developer Testing**: Open the browser console. You will see a test log demonstrating that the `api.fetchMovieByTitle('Inception')` module function fetches and returns a normalized movie object. The `api` object is exposed globally so you can test search commands directly, e.g., `await api.fetchMovieByTitle('The Matrix')`.


## Future Improvements
🔐 User login system with authentication

☁️ Backend database (instead of localStorage)

📊 Advanced filters (genre, rating, release year)
