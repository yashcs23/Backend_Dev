const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

const ACCESS_SECRET = 'access-secret-key-change-in-production';
const REFRESH_SECRET = 'refresh-secret-key-change-in-production';

const users = [];
const refreshTokens = new Set(); // Store valid refresh tokens

let userIdCounter = 1;

// Sample user for testing
const sampleUser = { id: 1, username: 'testuser', email: 'test@example.com' };
users.push(sampleUser);
userIdCounter = 2;

// Generate access token (15 minutes expiry)
function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email
    },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}

// Generate refresh token (7 days expiry)
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify access token middleware
function verifyAccessToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'No token provided',
      message: 'Authorization header required'
    });
  }

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Access token has expired. Please refresh your token.'
      });
    }

    return res.status(403).json({
      error: 'Invalid token',
      message: 'Token verification failed'
    });
  }
}

// Login endpoint
app.post('/login', (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({
        error: 'Username and email required'
      });
    }

    // Find or create user (for demo purposes)
    let user = users.find(u => u.username === username);

    if (!user) {
      user = {
        id: userIdCounter++,
        username,
        email
      };
      users.push(user);
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token
    refreshTokens.add(refreshToken);

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      expiresIn: '15m',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Refresh token endpoint
app.post('/token/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required'
      });
    }

    // Check if token is in the set (not revoked)
    if (!refreshTokens.has(refreshToken)) {
      return res.status(403).json({
        error: 'Invalid or revoked refresh token'
      });
    }

    // Verify refresh token
    try {
      const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

      // Find user
      const user = users.find(u => u.id === decoded.id);
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // Generate new tokens
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      // Remove old refresh token and add new one
      refreshTokens.delete(refreshToken);
      refreshTokens.add(newRefreshToken);

      res.status(200).json({
        message: 'Token refreshed successfully',
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: '15m'
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(403).json({
          error: 'Refresh token expired',
          message: 'Please log in again'
        });
      }

      return res.status(403).json({
        error: 'Invalid refresh token'
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Logout endpoint - invalidate refresh token
app.post('/logout', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required for logout'
      });
    }

    // Remove refresh token from valid set
    refreshTokens.delete(refreshToken);

    res.status(200).json({
      message: 'Logout successful',
      message2: 'Refresh token has been revoked'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Protected route - requires valid access token
app.get('/protected', verifyAccessToken, (req, res) => {
  res.status(200).json({
    message: 'Access to protected route granted',
    user: req.user
  });
});

// Get user profile
app.get('/profile', verifyAccessToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({
      error: 'User not found'
    });
  }

  res.status(200).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
});

// Get all users (for testing)
app.get('/users', (req, res) => {
  res.status(200).json({
    users: users
  });
});

// Verify token endpoint (check if token is valid)
app.post('/token/verify', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token required'
      });
    }

    try {
      const decoded = jwt.verify(token, ACCESS_SECRET);
      res.status(200).json({
        valid: true,
        user: decoded
      });
    } catch (error) {
      res.status(200).json({
        valid: false,
        reason: error.name === 'TokenExpiredError' ? 'expired' : 'invalid'
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get active tokens count (for demo/monitoring)
app.get('/admin/refresh-tokens-count', (req, res) => {
  res.status(200).json({
    activeRefreshTokens: refreshTokens.size
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`JWT Auth server running on port ${PORT}`);
  console.log('Sample user: testuser (email: test@example.com)');
  console.log('Access token expires in: 15 minutes');
  console.log('Refresh token expires in: 7 days');
});

module.exports = app;
