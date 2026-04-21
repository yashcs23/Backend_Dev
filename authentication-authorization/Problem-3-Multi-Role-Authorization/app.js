const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.json());

app.use(session({
  secret: 'auth-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// In-memory storage
const users = [];
const posts = [];
let userIdCounter = 1;
let postIdCounter = 1;

// Sample users with different roles
const sampleUsers = [
  { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' },
  { id: 2, username: 'moderator', email: 'mod@example.com', role: 'moderator' },
  { id: 3, username: 'user1', email: 'user1@example.com', role: 'user' }
];

userIdCounter = 4;
users.push(...sampleUsers);

// Authentication middleware - checks if user is logged in
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in first'
    });
  }
  next();
};

// Role-based authorization middleware factory
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires one of these roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Resource ownership check - user can edit own posts, moderators can edit any
const isOwnerOrModerator = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  const post = posts.find(p => p.id === parseInt(req.params.id));
  if (!post) {
    return res.status(404).json({
      error: 'Post not found'
    });
  }

  // Allow if user is owner, moderator, or admin
  const isOwner = post.authorId === req.session.user.id;
  const isModerator = req.session.user.role === 'moderator';
  const isAdmin = req.session.user.role === 'admin';

  if (!isOwner && !isModerator && !isAdmin) {
    return res.status(403).json({
      error: 'Insufficient permissions',
      message: 'You can only edit your own posts'
    });
  }

  next();
};

// Login endpoint
app.post('/login', (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        error: 'Username is required'
      });
    }

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    // Set session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.status(200).json({
      message: 'Login successful',
      user: req.session.user
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Logout endpoint
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
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

// Create post - authenticated users only
app.post('/posts', isAuthenticated, (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Title and content are required'
      });
    }

    const newPost = {
      id: postIdCounter++,
      title,
      content,
      authorId: req.session.user.id,
      author: req.session.user.username,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    posts.push(newPost);

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Edit post - owner, moderator, or admin
app.put('/posts/:id', isAuthenticated, isOwnerOrModerator, (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Title and content are required'
      });
    }

    const post = posts.find(p => p.id === parseInt(req.params.id));

    post.title = title;
    post.content = content;
    post.updatedAt = new Date();
    post.editedBy = req.session.user.username;

    res.status(200).json({
      message: 'Post updated successfully',
      post: post
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Delete post - moderator or admin only
app.delete('/posts/:id', isAuthenticated, requireRole(['moderator', 'admin']), (req, res) => {
  try {
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    const index = posts.indexOf(post);
    posts.splice(index, 1);

    res.status(200).json({
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get all posts
app.get('/posts', (req, res) => {
  res.status(200).json({
    posts: posts
  });
});

// Get single post
app.get('/posts/:id', (req, res) => {
  const post = posts.find(p => p.id === parseInt(req.params.id));

  if (!post) {
    return res.status(404).json({
      error: 'Post not found'
    });
  }

  res.status(200).json({
    post: post
  });
});

// Admin only: Manage users
app.get('/admin/users', isAuthenticated, requireRole('admin'), (req, res) => {
  res.status(200).json({
    users: users
  });
});

// Admin only: Update user role
app.put('/admin/users/:id/role', isAuthenticated, requireRole('admin'), (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role'
      });
    }

    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    user.role = role;

    res.status(200).json({
      message: 'User role updated',
      user: user
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Admin only: Delete user
app.delete('/admin/users/:id', isAuthenticated, requireRole('admin'), (req, res) => {
  try {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const index = users.indexOf(user);
    users.splice(index, 1);

    res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get current user
app.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      error: 'Not authenticated'
    });
  }

  res.status(200).json({
    user: req.session.user
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Multi-role auth server running on port ${PORT}`);
  console.log('Sample users:');
  console.log('- admin (role: admin)');
  console.log('- moderator (role: moderator)');
  console.log('- user1 (role: user)');
});

module.exports = app;
