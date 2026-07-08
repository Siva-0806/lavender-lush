const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name) errors.push('Name is required');
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push('Please enter a valid email');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};

const validateOrder = (req, res, next) => {
  const { items, shippingAddress, total } = req.body;
  const errors = [];

  if (!items || items.length === 0) errors.push('No order items');
  else {
    items.forEach(item => {
      if (!item.product || !item.quantity || item.quantity <= 0) {
        errors.push('Invalid item format');
      }
    });
  }
  
  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip || !shippingAddress.country) {
    errors.push('Incomplete shipping address');
  }

  if (total == null) errors.push('Total is required');

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};

const validateReview = (req, res, next) => {
  const { rating } = req.body;
  const errors = [];

  if (rating == null || rating < 1 || rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};

module.exports = { validateRegister, validateLogin, validateOrder, validateReview };
