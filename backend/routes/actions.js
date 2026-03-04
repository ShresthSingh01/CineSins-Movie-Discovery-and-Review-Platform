const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserAction = require('../models/UserAction');
const Profile = require('../models/Profile');

// Middleware to ensure the profile belongs to the authenticated user
async function checkProfileOwnership(req, res, next) {
    try {
        const profile = await Profile.findOne({ _id: req.params.profileId, userId: req.user.userId });
        if (!profile) return res.status(403).json({ message: 'Access denied to this profile' });
        next();
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// Get all reviews for a profile
router.get('/:profileId/reviews', auth, checkProfileOwnership, async (req, res) => {
    try {
        const reviews = await UserAction.find({ profileId: req.params.profileId, actionType: 'review' })
            .populate('movieId')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Save or Update a Review
router.post('/:profileId/reviews', auth, checkProfileOwnership, async (req, res) => {
    try {
        const { movieId, rating, reviewText } = req.body;
        if (!movieId) return res.status(400).json({ message: 'Movie ID required' });

        const action = await UserAction.findOneAndUpdate(
            { profileId: req.params.profileId, movieId, actionType: 'review' },
            { rating, reviewText, updatedAt: Date.now() },
            { new: true, upsert: true }
        );
        res.status(200).json(action);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete a Review
router.delete('/:profileId/reviews/:movieId', auth, checkProfileOwnership, async (req, res) => {
    try {
        await UserAction.findOneAndDelete({ profileId: req.params.profileId, movieId: req.params.movieId, actionType: 'review' });
        res.status(200).json({ message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get Watchlist for a profile
router.get('/:profileId/watchlist', auth, checkProfileOwnership, async (req, res) => {
    try {
        const watchlist = await UserAction.find({ profileId: req.params.profileId, actionType: 'watchlist' })
            .populate('movieId')
            .sort({ createdAt: -1 });
        res.json(watchlist);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Toggle Watchlist
router.post('/:profileId/watchlist', auth, checkProfileOwnership, async (req, res) => {
    try {
        const { movieId } = req.body;
        if (!movieId) return res.status(400).json({ message: 'Movie ID required' });

        const existing = await UserAction.findOne({ profileId: req.params.profileId, movieId, actionType: 'watchlist' });
        if (existing) {
            await UserAction.findByIdAndDelete(existing._id);
            return res.json({ message: 'Removed from watchlist', added: false });
        } else {
            const action = new UserAction({ profileId: req.params.profileId, movieId, actionType: 'watchlist' });
            await action.save();
            return res.status(201).json({ message: 'Added to watchlist', added: true, action });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
