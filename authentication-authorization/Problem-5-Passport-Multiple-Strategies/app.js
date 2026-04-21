const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const session = require('express-session');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

const JWT_SECRET = 'jwt-secret-key-change-in-production';

const users = [];

// Sample users for testing
const sampleUsers = [
  { id: 1, username: 'alice', password: 'password123', email: 'alice@example.com' },
  { id: 2, username: 'bob', password: 'password456', email: 'bob@example.com' }
];

users.push(...sampleUsers);
let userIdCounter = 3;

// Session setup
app.use(session({
  secret: 'session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Configure Local Strategy for username/password login
passport.use('local', new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  async (username, password, done) => {
    try {
      // Find user
      const user = users.find(u => u.username === username);

      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      // In production, use bcrypt for password comparison
      // For demo, simple string comparison
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Configure JWT Strategy for API authentication
passport.use('jwt', new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
  },
  async (payload, done) => {
    try {
      // Find user by id from JWT payload
      const user = users.find(u => u.id === payload.id);

      if (!user) {
        return done(null, false, { message: 'User not found' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Helper function to generate JWT
function generateJWT(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Post-login response helper
function loginResponse(user, isSessionAuth = false) {
  let response = {
    message: 'Login successful',
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  };

  if (isSessionAuth) {
    response.authMethod = 'session-based';
  } else {
    response.authMethod = 'token-based';
    response.accessToken = generateJWT(user);
  }

  return response;
}

// Login endpoint - session-based authentication
app.post('/auth/login', passport.authenticate('local', { failureMessage: true }), (req, res) => {
  // User is authenticated via session
  res.status(200).json(loginResponse(req.user, true));
});

// API Login endpoint - returns JWT token
app.post('/auth/api-login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password required'
      });
    }

    // Find user
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'User not found'
      });
    }

    // In production, use bcrypt
    if (user.password !== password) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Incorrect password'
      });
    }

    res.status(200).json(loginResponse(user, false));
  } catch (error) {
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

// Protected route with session authentication
app.get('/dashboard', passport.authenticate('local', { session: true, failureRedirect: '/login' }), (req, res) => {
  res.status(200).json({
    message: 'Welcome to dashboard',
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    },
    authMethod: 'session-based'
  });
});

// Alternative dashboard route - session check
app.get('/dashboard-simple', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in first'
    });
  }

  res.status(200).json({
    message: 'Welcome to dashboard',
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    },
    authMethod: 'session-based'
  });
});

// Protected route with JWT authentication
app.get('/api/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.status(200).json({
    message: 'User profile',
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    },
    authMethod: 'token-based'
  });
});

// Protected route with JWT - alternative
app.get('/api/data', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.status(200).json({
    message: 'Protected data',
    data: {
      userId: req.user.id,
      username: req.user.username,
      timestamp: new Date()
    }
  });
});

// Logout endpoint - destroy session
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Logout failed',
        message: err.message
      });
    }

    res.status(200).json({
      message: 'Logout successful'
    });
  });
});

// Check authentication status
app.get('/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({
      authenticated: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } else {
    res.status(200).json({
      authenticated: false
    });
  }
});

// Create account endpoint
app.post('/auth/register', (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({
        error: 'Username, password, and email required'
      });
    }

    // Check if user exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists'
      });
    }

    // Create new user
    const newUser = {
      id: userIdCounter++,
      username,
      password, // In production, hash with bcrypt
      email
    };

    users.push(newUser);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// List all users (for testing)
app.get('/users', (req, res) => {
  res.status(200).json({
    users: users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email
    }))
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Passport.js server running on port ${PORT}`);
  console.log('Sample users:');
  console.log('- alice (password: password123)');
  console.log('- bob (password: password456)');
  console.log('\nAuth methods:');
  console.log('- Session-based: POST /auth/login');
  console.log('- Token-based: POST /auth/api-login');
});

module.exports = app;
