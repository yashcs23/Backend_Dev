const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.json());

app.use(session({
  secret: 'cart-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Sample product database
const products = [
  { id: 1, name: 'Laptop', price: 999.99, stock: 10 },
  { id: 2, name: 'Mouse', price: 29.99, stock: 50 },
  { id: 3, name: 'Keyboard', price: 79.99, stock: 25 },
  { id: 4, name: 'Monitor', price: 299.99, stock: 15 },
  { id: 5, name: 'Headphones', price: 149.99, stock: 30 }
];

// Initialize cart middleware
const initCart = (req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  next();
};

app.use(initCart);

// Helper function to find product
function findProduct(productId) {
  return products.find(p => p.id === parseInt(productId));
}

// Helper function to find cart item
function findCartItem(cart, productId) {
  return cart.find(item => item.id === parseInt(productId));
}

// Helper function to calculate total
function calculateCartTotal(cart) {
  return cart.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0).toFixed(2);
}

// Add item to cart
app.post('/cart/add', (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate input
    if (!productId || !quantity) {
      return res.status(400).json({
        error: 'Product ID and quantity are required'
      });
    }

    const qty = parseInt(quantity);
    if (qty <= 0) {
      return res.status(400).json({
        error: 'Quantity must be greater than 0'
      });
    }

    // Find product
    const product = findProduct(productId);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    // Check stock
    if (product.stock < qty) {
      return res.status(400).json({
        error: `Insufficient stock. Available: ${product.stock}`
      });
    }

    // Check if item already in cart
    const existingItem = findCartItem(req.session.cart, productId);
    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      req.session.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: qty
      });
    }

    res.status(200).json({
      message: 'Item added to cart',
      cart: req.session.cart,
      total: calculateCartTotal(req.session.cart)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Update item quantity
app.put('/cart/update/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity) {
      return res.status(400).json({
        error: 'Quantity is required'
      });
    }

    const qty = parseInt(quantity);
    if (qty < 0) {
      return res.status(400).json({
        error: 'Quantity cannot be negative'
      });
    }

    // If quantity is 0, remove the item
    if (qty === 0) {
      req.session.cart = req.session.cart.filter(item => item.id !== parseInt(productId));
      return res.status(200).json({
        message: 'Item removed from cart',
        cart: req.session.cart,
        total: calculateCartTotal(req.session.cart)
      });
    }

    // Find product to check stock
    const product = findProduct(productId);
    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    if (product.stock < qty) {
      return res.status(400).json({
        error: `Insufficient stock. Available: ${product.stock}`
      });
    }

    // Find and update cart item
    const cartItem = findCartItem(req.session.cart, productId);
    if (!cartItem) {
      return res.status(404).json({
        error: 'Item not in cart'
      });
    }

    cartItem.quantity = qty;

    res.status(200).json({
      message: 'Cart item updated',
      cart: req.session.cart,
      total: calculateCartTotal(req.session.cart)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Remove item from cart
app.delete('/cart/remove/:productId', (req, res) => {
  try {
    const { productId } = req.params;

    const initialLength = req.session.cart.length;
    req.session.cart = req.session.cart.filter(item => item.id !== parseInt(productId));

    if (req.session.cart.length === initialLength) {
      return res.status(404).json({
        error: 'Item not in cart'
      });
    }

    res.status(200).json({
      message: 'Item removed from cart',
      cart: req.session.cart,
      total: calculateCartTotal(req.session.cart)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get cart
app.get('/cart', (req, res) => {
  try {
    const total = req.session.cart.length > 0 ? calculateCartTotal(req.session.cart) : '0.00';
    const itemCount = req.session.cart.reduce((count, item) => count + item.quantity, 0);

    res.status(200).json({
      cart: req.session.cart,
      itemCount: itemCount,
      total: total
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Clear cart
app.delete('/cart', (req, res) => {
  try {
    req.session.cart = [];

    res.status(200).json({
      message: 'Cart cleared',
      cart: req.session.cart,
      total: '0.00'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get all products (for reference)
app.get('/products', (req, res) => {
  res.status(200).json(products);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Shopping cart server running on port ${PORT}`);
});

module.exports = app;
