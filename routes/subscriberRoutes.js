const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/subscribe
// @desc    Subscribe to newsletter
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email' });
    }

    const subscriber = await Subscriber.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { $setOnInsert: { subscribedAt: new Date() } },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, message: 'Subscribed successfully', subscriber });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/subscribers
// @desc    Get all subscribers
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort('-subscribedAt');
    res.json({ success: true, count: subscribers.length, subscribers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
