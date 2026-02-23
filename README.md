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

**3. 🎬 TMDb Integration & Scene Image Carousel**
Now powered by **The Movie Database (TMDb)** for richer media data. Movie modals include an interactive "Scene Carousel" that automatically fetches and displays high-res backdrop images from the film.

**4. 🛡️ Fail-Safe Dual API Architecture**
Built for maximum uptime. If the primary TMDb API fails, rate-limits, or times out, the application intelligently catches the error and automatically falls back to the secondary **OMDb API** to ensure uninterrupted movie discovery.

**5. 🍿 Smart "Watch Now" Streaming**
Deep-links directly to local streaming providers (like Netflix, Prime, Hulu) by querying TMDb's `watch/providers` endpoint. If unavailable, falls back to an intelligent Google Search query.

**6. 📱 Modern Glassmorphism & Responsive UI**
A gorgeous, mobile-first responsive design. Features a sleek slide-in hamburger menu, precise CSS Grid layouts for complex forms, and perfectly aligned dual-action buttons that span elegantly across 320px screens.

**7. 🎨 Vibing Neon Aesthetics & Animations**
A "vibecoded", highly premium dark-mode aesthetic. Employs sharp neon pinks (`#ff0f7b`) and cyans (`#2df9fe`), infinitely animated text gradients, floating hover-state physics, and projecting drop-shadow pulses to create a living UI.

**8. 💖 Compatibility Mode**
Compare 3 favorite movies between two people. Computes a "Compatibility Score" based on genre/director overlap and emotional metric variance. Suggests 3 perfect joint "Date Night" movie picks and generates a shareable JSON blob.

**9. 🧬 CinemaDNA Analytics Dashboard**
Your personal viewing analytics. Aggregates your reviews to compute your *Favorite Genre*, *Average Runtime*, *Top 5 Directors*, *Total Watch Time*, and an overall *Mood Trend*. Renders a custom bar chart on an HTML `<canvas>` and lets you generate a downloadable **Share Card (PNG)**.

**10. 🕵️‍♂️ Anti-Spoiler Protection**
Automatically parses your written reviews for spoiler keywords (`ending`, `twist is`, `dies`, etc.). Automatically blurs out the spoiling sentences and places them behind an interactive "Allow Spoilers" toggle button.

**11. 🏷️ Progressive Web App (PWA) & Offline Cache**
Fully installable on desktop/mobile. Implements a Service Worker (`sw.js`). Includes a smart 20MB LRU cache specifically for movie posters so you can browse your entire synced library offline.

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

* **[0:00 - 0:05] Intro & Aesthetics**: "Welcome to CineSins! Notice the vibrant neon animated text and smooth hover physics. It's built to look premium and sharp."
* **[0:05 - 0:10] TMDb Search & Responsive Mobile**: "Searching for *Inception* on mobile looks perfect now thanks to CSS Grid. It queries TMDb, falling back to OMDb effortlessly if the network hiccups, ensuring pure uptime."
* **[0:10 - 0:15] Review Modal & Carousel**: "Inside the review modal, we automatically fetch and slide through gorgeous high-res movie scenes via the new Carousel. Then, we can hit 'Watch Now' which deep-links directly to a streaming provider."
* **[0:15 - 0:20] Anti-Spoiler & Offline Mode**: "If I type 'he dies' in my review, CineSins detects the spoiler and blurs it. Even if I go offline, the PWA service worker keeps all my cached movies rendering flawlessly."
* **[0:20 - 0:25] Decision Engine**: "Can't decide? 'Decision Mode' uses AI-lite metrics—like *Cognitive Load* or *Comfort Score*—to scan my local cache and recommend a masterpiece tailored exactly to my current mood."
* **[0:25 - 0:30] CinemaDNA**: "Finally, 'CinemaDNA' analyzes all my reviews into a gorgeous customized dashboard showing my mood trends, watch-time, and favorite directors, letting me export my DNA as a sleek shareable image card!"

---

## 🗺️ Developer Roadmap
- **v2.0**: Migrate `localStorage` to a lightweight backend (Node.js/Supabase) for cross-device syncing.
- **v2.1**: Implement full user authentication and friend lists.
- **v2.2**: Integrate real LLM processing (e.g., OpenAI/Gemini) to generate dynamic movie summaries and smarter semantic tag searching.
