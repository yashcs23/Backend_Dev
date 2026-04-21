const express = require('express');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.json());

const users = [];
const loginAttempts = new Map(); // email -> { count, lockUntil }

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds
const RESET_TIME = 60 * 60 * 1000; // 1 hour for attempt counter reset

// Sample users for testing
const sampleUsers = [
  {
    id: 1,
    username: 'alice',
    email: 'alice@example.com',
    password: 'hashedPassword123' // In production, use bcrypt
  },
  {
    id: 2,
    username: 'bob',
    email: 'bob@example.com',
    password: 'hashedPassword456'
  }
];

users.push(...sampleUsers);
let userIdCounter = 3;

// Check if account is locked
function checkLoginAttempts(email) {
  const attempt = loginAttempts.get(email);

  if (!attempt) {
    return { isLocked: false, remainingAttempts: MAX_ATTEMPTS };
  }

  const now = Date.now();

  // Check if account is locked
  if (attempt.lockUntil && now < attempt.lockUntil) {
    const minutesRemaining = Math.ceil((attempt.lockUntil - now) / 1000 / 60);
    return {
      isLocked: true,
      lockUntil: attempt.lockUntil,
      minutesRemaining: minutesRemaining,
      message: `Account is locked. Try again in ${minutesRemaining} minutes`
    };
  }

  // Clear lock if expired
  if (attempt.lockUntil && now >= attempt.lockUntil) {
    loginAttempts.delete(email);
    return { isLocked: false, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if attempts need to be reset (1 hour passed)
  if (attempt.firstAttemptTime && now - attempt.firstAttemptTime > RESET_TIME) {
    loginAttempts.delete(email);
    return { isLocked: false, remainingAttempts: MAX_ATTEMPTS };
  }

  const remainingAttempts = MAX_ATTEMPTS - attempt.count;
  return {
    isLocked: false,
    count: attempt.count,
    remainingAttempts: remainingAttempts
  };
}

// Record a failed login attempt
function recordFailedAttempt(email) {
  const attempt = loginAttempts.get(email) || {
    count: 0,
    firstAttemptTime: Date.now()
  };

  attempt.count += 1;
  attempt.lastAttemptTime = Date.now();

  // Lock account after MAX_ATTEMPTS
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockUntil = Date.now() + LOCK_TIME;
  }

  loginAttempts.set(email, attempt);

  return {
    count: attempt.count,
    isLocked: attempt.count >= MAX_ATTEMPTS,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - attempt.count)
  };
}

// Clear login attempts (on successful login)
function clearAttempts(email) {
  loginAttempts.delete(email);
}

// Get attempt info (for testing/monitoring)
function getAttemptInfo(email) {
  return loginAttempts.get(email) || null;
}

// Login endpoint with rate limiting
app.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required'
      });
    }

    // Check if account is locked
    const lockCheck = checkLoginAttempts(email);
    if (lockCheck.isLocked) {
      return res.status(429).json({
        error: 'Account locked',
        message: lockCheck.message,
        lockUntilTime: new Date(lockCheck.lockUntil),
        minutesRemaining: lockCheck.minutesRemaining
      });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      // Record failed attempt
      const attemptResult = recordFailedAttempt(email);

      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email not found',
        attemptInfo: {
          failedAttempts: attemptResult.count,
          remainingAttempts: attemptResult.remainingAttempts,
          isLocked: attemptResult.isLocked
        }
      });
    }

    // In production, use bcrypt.compare()
    // const passwordMatch = await bcrypt.compare(password, user.password);
    // For demo: simple string comparison
    const passwordMatch = user.password === password;

    if (!passwordMatch) {
      // Record failed attempt
      const attemptResult = recordFailedAttempt(email);

      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Incorrect password',
        attemptInfo: {
          failedAttempts: attemptResult.count,
          remainingAttempts: attemptResult.remainingAttempts,
          isLocked: attemptResult.isLocked,
          lockedMessage: attemptResult.isLocked ? `Account locked for 30 minutes` : undefined
        }
      });
    }

    // Successful login - clear attempts
    clearAttempts(email);

    res.status(200).json({
      message: 'Login successful',
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

// Create account endpoint
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password required'
      });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered'
      });
    }

    // In production, hash password with bcrypt
    // const hashedPassword = await bcrypt.hash(password, 10);
    // For demo: store plain text
    const newUser = {
      id: userIdCounter++,
      username,
      email,
      password: password
    };

    users.push(newUser);

    res.status(201).json({
      message: 'User registered successfully',
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

// Admin endpoint: Get login attempts info
app.get('/admin/login-attempts', (req, res) => {
  const attempts = [];

  loginAttempts.forEach((value, email) => {
    const info = {
      email,
      failedAttempts: value.count,
      lockUntil: value.lockUntil ? new Date(value.lockUntil) : null,
      isLocked: value.lockUntil && Date.now() < value.lockUntil,
      lastAttemptTime: new Date(value.lastAttemptTime),
      firstAttemptTime: new Date(value.firstAttemptTime)
    };

    attempts.push(info);
  });

  res.status(200).json({
    totalEmailsTracked: attempts.length,
    lockedAccounts: attempts.filter(a => a.isLocked).length,
    attempts
  });
});

// Admin endpoint: Clear all login attempts
app.post('/admin/clear-attempts', (req, res) => {
  const clearedCount = loginAttempts.size;
  loginAttempts.clear();

  res.status(200).json({
    message: 'All login attempts cleared',
    clearedCount
  });
});

// Admin endpoint: Clear specific user's attempts
app.delete('/admin/login-attempts/:email', (req, res) => {
  const { email } = req.params;

  if (!loginAttempts.has(email)) {
    return res.status(404).json({
      error: 'No login attempts recorded for this email'
    });
  }

  loginAttempts.delete(email);

  res.status(200).json({
    message: `Login attempts cleared for ${email}`
  });
});

// Endpoint: Check account status
app.post('/check-account-status', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email required'
      });
    }

    const lockCheck = checkLoginAttempts(email);
    const attemptInfo = getAttemptInfo(email);

    res.status(200).json({
      email,
      isLocked: lockCheck.isLocked,
      failedAttempts: attemptInfo?.count || 0,
      remainingAttempts: lockCheck.remainingAttempts,
      lockUntil: lockCheck.lockUntil ? new Date(lockCheck.lockUntil) : null,
      minutesRemaining: lockCheck.minutesRemaining || null,
      message: lockCheck.message || 'Account is active'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error checking account status',
      message: error.message
    });
  }
});

// Endpoint: Reset password (admin only, clears attempts)
app.post('/admin/reset-user-lockout', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email required'
      });
    }

    const hadAttempts = loginAttempts.has(email);
    clearAttempts(email);

    res.status(200).json({
      message: 'User lockout reset',
      email,
      hadPreviousAttempts: hadAttempts
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error resetting lockout',
      message: error.message
    });
  }
});

// Get all users (for testing)
app.get('/users', (req, res) => {
  res.status(200).json({
    users: users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email
    }))
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    config: {
      maxAttempts: MAX_ATTEMPTS,
      lockoutDuration: `${LOCK_TIME / 60 / 1000} minutes`,
      resetDuration: `${RESET_TIME / 60 / 1000} minutes`
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Rate-limited login server running on port ${PORT}`);
  console.log('\nConfiguration:');
  console.log(`- Max login attempts: ${MAX_ATTEMPTS}`);
  console.log(`- Account lockout duration: ${LOCK_TIME / 60 / 1000} minutes`);
  console.log(`- Attempt counter reset time: ${RESET_TIME / 60 / 1000} minutes`);
  console.log('\nSample users:');
  console.log('- alice@example.com (password: hashedPassword123)');
  console.log('- bob@example.com (password: hashedPassword456)');
});

module.exports = app;
