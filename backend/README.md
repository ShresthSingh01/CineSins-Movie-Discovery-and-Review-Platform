# CineSins Backend Server

A robust Node.js, Express, and MongoDB backend designed to securely manage user authentication, profile states (watchlists, reviews), and proxy external API calls (TMDB, OMDB, Gemini) for the CineSins frontend application.

## Prerequisites
- Node.js (v18+)
- MongoDB server running locally (or MongoDB Atlas)

## Setup Instructions

1. **Install Dependencies**
   Navigate to this `backend` folder and run:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Open the `.env` file in this directory and add your real API keys securely:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/cinesins
   JWT_SECRET=super_secret_key
   TMDB_API_KEY=your_real_tmdb_key_here
   OMDB_API_KEY=5dddf095
   GEMINI_API_KEY=your_real_gemini_key_here
   ```

3. **Start the Backend Server**
   ```bash
   npm run dev
   # or
   node server.js
   ```
   The backend will run on `http://localhost:5000`.

## Connecting the Frontend
The frontend files (`api.js`, `auth.js`, `store.js`) have already been modified to point to `http://localhost:5000/api`.
Simply run the frontend in a separate terminal from the root folder:
```bash
npx serve .
```

You can now register real accounts, securely cache movie fetches, and persist reviews to MongoDB!
