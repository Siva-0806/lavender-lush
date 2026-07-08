const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validate');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, validateOrder, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, total } = req.body;

    const orderNumber = `LL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const order = new Order({
      customerName: req.user.name,
      email: req.user.email,
      items,
      shippingAddress,
      paymentMethod,
      total,
      orderNumber,
      phone: req.user.phone
    });

    const createdOrder = await order.save();

    // Decrement stock for each item
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get logged in user's orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ email: req.user.email })
      .populate('items.product', 'name image price')
      .sort('-createdAt');
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name image price');
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Allow user to view their own order or admin to view any
    if (order.email !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to view this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/orders/admin/all
// @desc    Get all orders
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    
    const count = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('items.product', 'name')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({ success: true, count, page: Number(page), pages: Math.ceil(count / limit), orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, paymentStatus, trackingId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingId) order.trackingId = trackingId;

    const updatedOrder = await order.save();
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
