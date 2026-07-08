const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route   GET /api/wishlist
// @desc    Get user wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist', 'name price image category slug');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/wishlist/:productId
// @desc    Toggle product in wishlist
// @access  Private
router.post('/:productId', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    const user = await User.findById(req.user.id);
    const index = user.wishlist.indexOf(req.params.productId);

    let message;
    if (index > -1) {
      user.wishlist.splice(index, 1);
      message = 'Removed from wishlist';
    } else {
      user.wishlist.push(req.params.productId);
      message = 'Added to wishlist';
    }

    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('wishlist', 'name price image category slug');

    res.json({ success: true, message, wishlist: updatedUser.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
