const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const users = {
  'admin@example.com': {
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    name: 'Admin User'
  },
  'moderator@example.com': {
    password: bcrypt.hashSync('mod123', 10),
    role: 'moderator',
    name: 'Moderator User'
  },
  'user@example.com': {
    password: bcrypt.hashSync('user123', 10),
    role: 'user',
    name: 'Regular User'
  }
};

const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/exercise3/login');
  }
  next();
};

const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/exercise3/login');
    }
    
    if (!allowedRoles.includes(req.session.user.role)) {
      return res.render('exercise3/access-denied', { 
        message: 'You do not have permission to access this page'
      });
    }
    
    next();
  };
};

router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/exercise3/dashboard');
  }
  res.render('exercise3/login');
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.render('exercise3/login', { error: 'Email and password are required' });
  }
  
  const user = users[email];
  
  if (!user) {
    return res.render('exercise3/login', { error: 'Invalid credentials' });
  }
  
  if (!bcrypt.compareSync(password, user.password)) {
    return res.render('exercise3/login', { error: 'Invalid credentials' });
  }
  
  req.session.user = {
    email: email,
    name: user.name,
    role: user.role,
    loginTime: new Date()
  };
  
  res.redirect('/exercise3/dashboard');
});

router.get('/dashboard', requireLogin, (req, res) => {
  res.render('exercise3/dashboard', { user: req.session.user });
});

router.get('/admin', requireRole(['admin']), (req, res) => {
  const adminData = {
    totalUsers: 150,
    activeUsers: 89,
    totalSessions: 234,
    systemHealth: '99.8%'
  };
  
  res.render('exercise3/admin', { user: req.session.user, data: adminData });
});

router.get('/moderator', requireRole(['admin', 'moderator']), (req, res) => {
  const moderatorData = {
    pendingReports: 12,
    resolvedToday: 5,
    usersManaged: 45
  };
  
  res.render('exercise3/moderator', { user: req.session.user, data: moderatorData });
});

router.get('/profile', requireLogin, (req, res) => {
  res.render('exercise3/profile', { user: req.session.user });
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.render('exercise3/error', { message: 'Logout failed' });
    }
    res.redirect('/exercise3/login');
  });
});

router.get('/session-info', requireLogin, (req, res) => {
  res.json({
    user: req.session.user,
    sessionId: req.sessionID,
    sessionExpire: req.session.cookie._expires
  });
});

module.exports = router;
