require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`${req.method} ${req.url}`);
    }
    next();
  });
}

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/subscribe', require('./routes/subscriberRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Custom Order WhatsApp endpoint
app.post('/api/whatsapp', (req, res) => {
  console.log('\n[WhatsApp Message Sent in Background]', req.body.message, '\n');
  res.json({success:true});
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Lavender Lush API is running', timestamp: new Date().toISOString() });
});

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  const file = req.path.endsWith('.html') ? req.path.slice(1) : 'index.html';
  res.sendFile(path.join(__dirname, 'public', file), (err) => {
    if (err) res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
});

// Global error handler (must be after routes)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n  🌸 Lavender Lush Server`);
  console.log(`  → Local:  http://localhost:${PORT}`);
  console.log(`  → API:    http://localhost:${PORT}/api/health`);
  console.log(`  → Mode:   ${process.env.NODE_ENV || 'development'}\n`);
});
