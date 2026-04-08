const express = require('express');
const router = express.Router();

const products = [
  { id: 1, name: 'Laptop', price: 999.99, image: 'laptop.jpg' },
  { id: 2, name: 'Phone', price: 599.99, image: 'phone.jpg' },
  { id: 3, name: 'Tablet', price: 299.99, image: 'tablet.jpg' },
  { id: 4, name: 'Headphones', price: 99.99, image: 'headphones.jpg' },
  { id: 5, name: 'Smart Watch', price: 199.99, image: 'watch.jpg' }
];

const users = {
  'user@example.com': {
    password: 'password123',
    name: 'Test User',
    cart: []
  }
};

const getCart = (req) => {
  if (req.session.user) {
    return users[req.session.user.email].cart || [];
  }
  
  if (!req.session.anonymousCart) {
    req.session.anonymousCart = [];
  }
  
  return req.session.anonymousCart;
};

const saveCart = (req, cart) => {
  if (req.session.user) {
    users[req.session.user.email].cart = cart;
  } else {
    req.session.anonymousCart = cart;
  }
};

const getProduct = (productId) => {
  return products.find(p => p.id === parseInt(productId));
};

router.get('/', (req, res) => {
  const cart = getCart(req);
  const isAuthenticated = !!req.session.user;
  
  res.render('exercise5/shop', { 
    products: products,
    cart: cart,
    isAuthenticated: isAuthenticated,
    user: req.session.user
  });
});

router.get('/cart', (req, res) => {
  const cart = getCart(req);
  const cartItems = cart.map(item => {
    const product = getProduct(item.productId);
    return {
      ...item,
      productName: product.name,
      productPrice: product.price,
      subtotal: product.price * item.quantity
    };
  });
  
  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const isAuthenticated = !!req.session.user;
  
  res.render('exercise5/cart', { 
    cartItems: cartItems,
    total: total.toFixed(2),
    isAuthenticated: isAuthenticated,
    user: req.session.user,
    cartEmpty: cart.length === 0
  });
});

router.post('/add-to-cart', (req, res) => {
  const { productId, quantity } = req.body;
  const product = getProduct(productId);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const cart = getCart(req);
  const existingItem = cart.find(item => item.productId === parseInt(productId));
  
  if (existingItem) {
    existingItem.quantity += parseInt(quantity);
  } else {
    cart.push({
      productId: parseInt(productId),
      quantity: parseInt(quantity)
    });
  }
  
  saveCart(req, cart);
  
  res.json({ 
    message: 'Product added to cart',
    cartSize: cart.length 
  });
});

router.post('/remove-from-cart', (req, res) => {
  const { productId } = req.body;
  let cart = getCart(req);
  
  cart = cart.filter(item => item.productId !== parseInt(productId));
  saveCart(req, cart);
  
  res.json({ 
    message: 'Product removed from cart',
    cartSize: cart.length 
  });
});

router.post('/update-quantity', (req, res) => {
  const { productId, quantity } = req.body;
  const cart = getCart(req);
  
  const item = cart.find(item => item.productId === parseInt(productId));
  
  if (item) {
    if (quantity <= 0) {
      saveCart(req, cart.filter(i => i.productId !== parseInt(productId)));
    } else {
      item.quantity = parseInt(quantity);
      saveCart(req, cart);
    }
  }
  
  res.json({ message: 'Quantity updated' });
});

router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/exercise5/cart');
  }
  res.render('exercise5/login');
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.render('exercise5/login', { error: 'Email and password are required' });
  }
  
  const user = users[email];
  
  if (!user || user.password !== password) {
    return res.render('exercise5/login', { error: 'Invalid credentials' });
  }
  
  const anonymousCart = req.session.anonymousCart || [];
  
  if (!users[email].cart) {
    users[email].cart = [];
  }
  
  for (const anonItem of anonymousCart) {
    const existingItem = users[email].cart.find(item => item.productId === anonItem.productId);
    
    if (existingItem) {
      existingItem.quantity += anonItem.quantity;
    } else {
      users[email].cart.push(anonItem);
    }
  }
  
  req.session.user = {
    email: email,
    name: user.name
  };
  
  req.session.anonymousCart = [];
  
  res.redirect('/exercise5/cart');
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.render('exercise5/error', { message: 'Logout failed' });
    }
    res.redirect('/exercise5');
  });
});

router.post('/checkout', (req, res) => {
  const cart = getCart(req);
  
  if (cart.length === 0) {
    return res.json({ error: 'Cart is empty' });
  }
  
  if (!req.session.user) {
    return res.status(401).json({ error: 'Please login to checkout' });
  }
  
  const cartItems = cart.map(item => {
    const product = getProduct(item.productId);
    return {
      productName: product.name,
      quantity: item.quantity,
      price: product.price
    };
  });
  
  saveCart(req, []);
  
  res.json({ 
    message: 'Checkout successful',
    orderId: 'ORD-' + Date.now(),
    items: cartItems
  });
});

router.get('/api/cart-info', (req, res) => {
  const cart = getCart(req);
  const isAuthenticated = !!req.session.user;
  
  res.json({
    itemCount: cart.length,
    isAuthenticated: isAuthenticated,
    user: req.session.user ? req.session.user.name : 'Anonymous'
  });
});

module.exports = router;
