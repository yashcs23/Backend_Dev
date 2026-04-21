const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
app.use(express.json());

const users = [];

// Validate password: at least 8 characters, uppercase, lowercase, number, special character
function validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Validate email format
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Registration endpoint
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are required'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Password validation failed',
        details: passwordValidation.errors
      });
    }

    // Check for duplicate email
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    // Check for duplicate username
    const userWithUsername = users.find(u => u.username === username);
    if (userWithUsername) {
      return res.status(409).json({
        error: 'Username already taken'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Store user
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    users.push(newUser);

    // Return success response (without password)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Endpoint to list all users (for testing purposes only)
app.get('/users', (req, res) => {
  res.json(users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    createdAt: u.createdAt
  })));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
