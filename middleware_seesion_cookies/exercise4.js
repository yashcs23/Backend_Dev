const express = require('express');
const router = express.Router();

const SESSION_TIMEOUT = 1000 * 60 * 10;
const WARNING_TIME = 1000 * 60 * 8;

const users = {
  'user@example.com': {
    password: 'password123',
    name: 'Test User'
  }
};

const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/exercise4/login');
  }
  next();
};

router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/exercise4/dashboard');
  }
  res.render('exercise4/login');
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.render('exercise4/login', { error: 'Email and password are required' });
  }
  
  const user = users[email];
  
  if (!user || user.password !== password) {
    return res.render('exercise4/login', { error: 'Invalid credentials' });
  }
  
  req.session.user = {
    email: email,
    name: user.name,
    loginTime: new Date(),
    lastActivity: new Date()
  };
  
  req.session.cookie.maxAge = SESSION_TIMEOUT;
  
  res.redirect('/exercise4/dashboard');
});

router.get('/dashboard', requireLogin, (req, res) => {
  const now = new Date();
  const sessionStart = req.session.user.loginTime;
  const elapsedTime = now - sessionStart;
  const remainingTime = SESSION_TIMEOUT - elapsedTime;
  const warningThreshold = SESSION_TIMEOUT - WARNING_TIME;
  
  const showWarning = elapsedTime > warningThreshold;
  
  res.render('exercise4/dashboard', { 
    user: req.session.user,
    remainingTime: Math.max(0, remainingTime),
    sessionTimeout: SESSION_TIMEOUT,
    showWarning: showWarning,
    warningThreshold: warningThreshold
  });
});

router.post('/extend-session', requireLogin, (req, res) => {
  req.session.user.lastActivity = new Date();
  req.session.cookie.maxAge = SESSION_TIMEOUT;
  
  res.json({ 
    message: 'Session extended',
    newExpireTime: new Date(Date.now() + SESSION_TIMEOUT)
  });
});

router.get('/check-timeout', requireLogin, (req, res) => {
  const now = new Date();
  const sessionStart = req.session.user.loginTime;
  const elapsedTime = now - sessionStart;
  const remainingTime = SESSION_TIMEOUT - elapsedTime;
  const warningThreshold = SESSION_TIMEOUT - WARNING_TIME;
  
  res.json({
    remainingTime: Math.max(0, remainingTime),
    isWarning: elapsedTime > warningThreshold,
    sessionTimeout: SESSION_TIMEOUT,
    elapsedTime: elapsedTime
  });
});

router.post('/activity', requireLogin, (req, res) => {
  req.session.user.lastActivity = new Date();
  res.json({ message: 'Activity recorded' });
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.render('exercise4/error', { message: 'Logout failed' });
    }
    res.redirect('/exercise4/login');
  });
});

module.exports = router;
