const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // IMDB or TMDB ID
    title: { type: String, required: true },
    poster: { type: String },
    genres: { type: String },
    director: { type: String },
    year: { type: String },
    metrics: {
        emotionalIntensity: { type: Number, default: 50 },
        cognitiveLoad: { type: Number, default: 50 },
        comfortScore: { type: Number, default: 50 }
    },
    hiddenScore: { type: Number, default: 0 },
    lastFetched: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Movie', movieSchema);
