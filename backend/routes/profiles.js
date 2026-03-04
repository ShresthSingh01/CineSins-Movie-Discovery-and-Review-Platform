const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');

// Get all profiles for user
router.get('/', auth, async (req, res) => {
    try {
        const profiles = await Profile.find({ userId: req.user.userId });
        res.json(profiles);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Create new profile
router.post('/', auth, async (req, res) => {
    try {
        const { name, emoji, color } = req.body;
        if (!name) return res.status(400).json({ message: 'Profile name required' });

        const profile = new Profile({
            userId: req.user.userId,
            name,
            emoji: emoji || '🎭',
            color: color || '#8b5cf6'
        });

        await profile.save();
        res.status(201).json(profile);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete profile
router.delete('/:id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.json({ message: 'Profile deleted' });
        // NOTE: Also should cleanup user actions, watchlists, etc linked to this profile
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update profile archetype or details
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, emoji, color, archetype } = req.body;
        const profile = await Profile.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            { $set: { name, emoji, color, archetype } },
            { new: true, omitUndefined: true }
        );
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
