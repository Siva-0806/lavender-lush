const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/admin/dashboard
// @desc    Get dashboard stats
// @access  Private/Admin
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const [ordersCount, productsCount, usersCount, recentOrders, allOrders] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.find().sort('-createdAt').limit(5).populate('items.product', 'name'),
      Order.find()
    ]);

    const totalRevenue = allOrders.reduce((acc, order) => acc + order.total, 0);

    const ordersByStatus = allOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      stats: {
        totalOrders: ordersCount,
        totalRevenue,
        totalProducts: productsCount,
        totalCustomers: usersCount,
        ordersByStatus
      },
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/admin/customers
// @desc    Get all customers
// @access  Private/Admin
router.get('/customers', protect, admin, async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password').sort('-createdAt');
    res.json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
