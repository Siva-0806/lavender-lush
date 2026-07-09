require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Subscriber = require('../models/Subscriber');
const Cart = require('../models/Cart');

const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Product.deleteMany();
    await User.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();
    await Subscriber.deleteMany();
    await Cart.deleteMany();

    console.log('Existing data cleared');

    // Create users
    const adminUser = await User.create({
      name: 'Admin',
      email: 'lavenderlush1211@gmail.com',
      password: 'Llush@2007',
      role: 'admin'
    });

    const customerUser = await User.create({
      name: 'Priya M',
      email: 'priya@example.com',
      password: 'customer123',
      role: 'customer'
    });

    console.log('Users created');

    // Create products
    const products = [
      {
        name: 'Lilac Tulip Bouquet',
        category: 'bouquets',
        price: 38,
        oldPrice: 46,
        badge: 'Bestseller',
        rating: 5,
        reviewCount: 212,
        image: 'https://picsum.photos/seed/tulip-bq/500/500',
        featured: true,
        stock: 25,
        sku: 'LL-BQ-001',
        description: 'A stunning handmade crochet tulip bouquet in soft lilac tones...'
      },
      {
        name: 'Lavender Bunny Plushie',
        category: 'plushies',
        price: 34,
        badge: 'Bestseller',
        rating: 4,
        reviewCount: 158,
        image: 'https://picsum.photos/seed/bunny-plushie/500/500',
        featured: true,
        stock: 18,
        sku: 'LL-PL-001'
      },
      {
        name: 'Strawberry Charm Keychain',
        category: 'keychains',
        price: 14,
        rating: 5,
        reviewCount: 94,
        image: 'https://picsum.photos/seed/strawberry-key/500/500',
        stock: 50,
        sku: 'LL-KC-001'
      },
      {
        name: 'Luxury Lavender Gift Box',
        category: 'giftboxes',
        price: 58,
        badge: 'Bestseller',
        rating: 5,
        reviewCount: 76,
        image: 'https://picsum.photos/seed/luxury-giftbox/500/500',
        featured: true,
        stock: 12,
        sku: 'LL-GB-001'
      },
      {
        name: 'Sunny Sunflower Bunch',
        category: 'bouquets',
        price: 42,
        badge: 'New',
        rating: 5,
        reviewCount: 41,
        image: 'https://picsum.photos/seed/sunflower-bunch/500/500',
        stock: 20,
        sku: 'LL-BQ-002'
      },
      {
        name: 'Sage Teddy Plushie',
        category: 'plushies',
        price: 36,
        rating: 4,
        reviewCount: 63,
        image: 'https://picsum.photos/seed/teddy-plushie/500/500',
        stock: 15,
        sku: 'LL-PL-002'
      },
      {
        name: 'Daisy Chain Keychain',
        category: 'keychains',
        price: 16,
        badge: 'New',
        rating: 5,
        reviewCount: 18,
        image: 'https://picsum.photos/seed/daisy-key/500/500',
        stock: 40,
        sku: 'LL-KC-002'
      },
      {
        name: 'Newborn Welcome Box',
        category: 'giftboxes',
        price: 48,
        rating: 4.5,
        reviewCount: 32,
        image: 'https://picsum.photos/seed/newborn-box/500/500',
        stock: 10,
        sku: 'LL-GB-002'
      }
    ];

    const createdProducts = await Promise.all(products.map(p => Product.create(p)));
    console.log('Products created');

    // Create a review
    await Review.create({
      product: createdProducts[0]._id,
      user: customerUser._id,
      rating: 5,
      title: 'Amazing bouquet',
      comment: 'The bouquet was even prettier in person. Packaging felt so premium.'
    });

    console.log('Reviews created');

    console.log('Data Import Success');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
