const mongoose = require('mongoose');

const userActionSchema = new mongoose.Schema({
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    movieId: { type: String, ref: 'Movie', required: true },
    actionType: { type: String, enum: ['review', 'watchlist', 'view'], required: true },
    rating: { type: Number, min: 0, max: 10 },
    reviewText: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure a profile can only have one review/watchlist per movie
userActionSchema.index({ profileId: 1, movieId: 1, actionType: 1 }, { unique: true });

module.exports = mongoose.model('UserAction', userActionSchema);
