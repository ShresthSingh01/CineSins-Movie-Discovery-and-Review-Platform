# CineSins

An interactive movie discovery, tracking, and personal analytics web platform built with HTML, CSS, and Vanilla JavaScript. 
CineSins allows users to search movies (via OMDb API), log reviews, analyze their viewing habits, compute compatibility with friends, and discover hidden gems—all locally cached and available offline.

![Dashboard Preview](https://via.placeholder.com/800x400.png?text=CineSins+Dashboard+Screenshot)

---

## 🚀 New & Advanced Features

**1. 🧠 Decision Mode (AI-Driven Recommendations)**
Takes your current *Mood*, *Available Time*, and *Company*, and computes the perfect movie from your local cache using a weighted Euclidean distance algorithm against Emotional Metrics.

**2. 📊 Emotional Metrics Engine**
Computes deep film metrics (`emotionalIntensity`, `cognitiveLoad`, `comfortScore`) on-the-fly based on a movie's genres, runtime, and IMDb rating.

**3. 🏷️ Scene Tags & Export**
Tag specific scenes within a movie (e.g., "plot twist", "heist"). All tags are searchable globally and can be exported/imported as a JSON backup file.

**4. 💎 Hidden Gems Discovery**
Calculates a unique `Hidden Score` (`imdbRating / log(1 + imdbVotes)`) to uncover highly-rated but under-watched masterpieces from your cache.

**5. 💖 Compatibility Mode**
Compare 3 favorite movies between two people. Computes a "Compatibility Score" based on genre/director overlap and emotional metric variance. Suggests 3 perfect joint "Date Night" movie picks and generates a shareable JSON blob.

**6. 🧬 CinemaDNA Analytics Dashboard**
Your personal viewing analytics. Aggregates your reviews to compute your *Favorite Genre*, *Average Runtime*, *Top 5 Directors*, *Total Watch Time*, and an overall *Mood Trend*. Renders a custom bar chart on an HTML `<canvas>` and lets you generate a downloadable **Share Card (PNG)**.

**7. 🕵️‍♂️ Anti-Spoiler Protection**
Automatically parses your written reviews for spoiler keywords (`ending`, `twist is`, `dies`, etc.). Automatically blurs out the spoiling sentences and places them behind an interactive "Allow Spoilers" toggle button.

**8. 📱 Progressive Web App (PWA) & Offline Mode**
Fully installable on desktop/mobile. Implements a Service Worker (`sw.js`) that caches the App Shell and intercepts API responses. Includes a smart 20MB LRU cache specifically for movie posters so you can browse your entire synced library without an internet connection. An "Offline Available" badge appears automatically when network is lost.

---

## 🛠️ How to Run Locally

You must run CineSins on a local web server (due to ES6 module CORS restrictions).

1. **Clone the repository.**
2. **Start a static server** in the root directory:
   - **Node.js**: `npx serve .`
   - **Python 3**: `python -m http.server 8000`
   - **VS Code**: Use the *Live Server* extension.
3. Open `http://localhost:8000` (or your chosen port) in your browser.

*(Note: CineSins can also be trivially deployed for free to **GitHub Pages**, **Vercel**, or **Netlify** by pointing the build directory to the root directory.)*

---

## 🧪 Feature Testing Guide

Here is how you can test each of the major features with example inputs:

### Seeding Movies (Crucial for Offline & Analytics)
Many features rely on a populated local database. 
1. Go to the "Home" tab.
2. Search for at least 5-10 distinct movies (e.g., *Inception*, *The Matrix*, *Titanic*, *Gladiator*, *Alien*).
3. Click on them to open the modal, and leave a 5-star review to add them to your `CinemaDNA`.

### 1. Testing Decision Mode
1. Click the **"Decision Mode"** button floating at the bottom right of the screen.
2. **Example Input**:
   - Mood: *Comfort*
   - Time: *90 mins*
   - Company: *Alone*
3. Click "Get Recommendations". It will suggest movies from your cached history that lean heavily towards high `comfortScore` and lower runtimes.

### 2. Testing Anti-Spoiler
1. Search a movie (e.g., *The Sixth Sense*).
2. Write a review containing a spoiler keyword:
   > *"This movie was phenomenal. The acting was superb. However, the twist is that he was dead the whole time!"*
3. Save the review and navigate to the **"My Reviews"** tab.
4. The first two sentences will be visible, but the spoiler sentence will be blurred out with an "Allow Spoilers" toggle.

### 3. Testing Compatibility Mode
1. Navigate to the **"Compatibility"** tab.
2. Enter the following exact titles into the inputs to ensure a cache hit:
   - **Person A**: *The Matrix*, *Inception*, *Interstellar*
   - **Person B**: *The Notebook*, *Titanic*, *La La Land*
3. Click **"Calculate Compatibility"**. You will see a low score, mutually exclusive genres, and a raw JSON export blob.

### 4. Testing PWA Offline Mode
1. Search and view a few movies to cache their data and posters.
2. Open Chrome DevTools (F12) -> **Network** tab.
3. Change the throttling dropdown from "No throttling" to **"Offline"**.
4. Refresh the page. The app will instantly load from the Service Worker, the orange "Offline Available" badge will appear, and you can still view your previously searched movies and reviews!

---

## 🎬 30-Second Demo Script (For Video Presentation)

* **[0:00 - 0:05] Intro & PWA**: "Welcome to CineSins! Notice the 'Install App' button—this is a fully functional Progressive Web App. It works completely offline, caching API requests and posters as we browse."
* **[0:05 - 0:10] Search & UX**: "Let's search for *Inception*. The UI is fast, responsive, and cinematic. I can open it, add custom 'Scene Tags' like *#dream-heist*, and quickly write a review."
* **[0:10 - 0:15] Anti-Spoiler**: "If I try to ruin the movie by typing 'the ending was crazy because he dies', CineSins automatically detects the spoiler keyword and blurs the text on the Review feed to protect my friends."
* **[0:15 - 0:20] Decision & Hidden Gems**: "Can't decide what to watch? 'Decision Mode' uses an AI-lite emotional metrics engine to pick a movie based on my current mood and time. We also have a 'Hidden Gems' tab that mathematically surfaces highly-rated but under-voted films."
* **[0:20 - 0:25] Compatibility**: "Planning a movie date? In 'Compatibility Mode', two users enter their top 3 films. CineSins calculates their architectural overlap and suggests perfect joint picks."
* **[0:25 - 0:30] CinemaDNA**: "Finally, 'CinemaDNA' analyzes all my reviews into a gorgeous customized dashboard showing my mood trends, watch-time, and favorite directors, letting me export my DNA as a sleek shareable image card!"

---

## 🗺️ Developer Roadmap
- **v2.0**: Migrate `localStorage` to a lightweight backend (Node.js/Supabase) for cross-device syncing.
- **v2.1**: Implement full user authentication and friend lists.
- **v2.2**: Integrate real LLM processing (e.g., OpenAI/Gemini) to generate dynamic movie summaries and smarter semantic tag searching.
