const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: Number,
    price: Number
  }],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'contacted', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  phone: String,
  paymentMethod: { type: String, enum: ['cod', 'card', 'upi', 'whatsapp'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  trackingId: String,
  orderNumber: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
