const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { validateReview } = require('../middleware/validate');

const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const reviewCount = reviews.length;
  const rating = reviewCount === 0 
    ? 0 
    : reviews.reduce((acc, item) => item.rating + acc, 0) / reviewCount;
  
  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(rating * 10) / 10,
    reviewCount
  });
};

// @route   GET /api/products/:productId/reviews
// @desc    Get all reviews for a product
// @access  Public
router.get('/products/:productId/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   POST /api/products/:productId/reviews
// @desc    Create new review
// @access  Private
router.post('/products/:productId/reviews', protect, validateReview, async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user.id
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, error: 'Product already reviewed' });
    }

    const review = new Review({
      product: productId,
      user: req.user.id,
      rating: Number(rating),
      title,
      comment
    });

    await review.save();
    await updateProductRating(productId);

    res.status(201).json({ success: true, message: 'Review added' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Product already reviewed' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    // Ensure the review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const productId = review.product;
    await review.deleteOne();
    await updateProductRating(productId);

    res.json({ success: true, message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
