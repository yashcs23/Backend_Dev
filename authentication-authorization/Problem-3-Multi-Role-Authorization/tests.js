const request = require('supertest');
const app = require('./app');

describe('Multi-Role Authorization System', () => {
  let adminAgent, moderatorAgent, userAgent;

  beforeAll(() => {
    adminAgent = request.agent(app);
    moderatorAgent = request.agent(app);
    userAgent = request.agent(app);
  });

  // Test 1: Login as different roles
  test('POST /login - Should login admin', async () => {
    const response = await adminAgent
      .post('/login')
      .send({ username: 'admin' });

    expect(response.statusCode).toBe(200);
    expect(response.body.user).toHaveProperty('role', 'admin');
  });

  test('POST /login - Should login moderator', async () => {
    const response = await moderatorAgent
      .post('/login')
      .send({ username: 'moderator' });

    expect(response.statusCode).toBe(200);
    expect(response.body.user).toHaveProperty('role', 'moderator');
  });

  test('POST /login - Should login user', async () => {
    const response = await userAgent
      .post('/login')
      .send({ username: 'user1' });

    expect(response.statusCode).toBe(200);
    expect(response.body.user).toHaveProperty('role', 'user');
  });

  // Test 2: Create post as authenticated user
  test('POST /posts - Authenticated user should create post', async () => {
    const response = await userAgent
      .post('/posts')
      .send({
        title: 'My First Post',
        content: 'This is my first post'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('message', 'Post created successfully');
    expect(response.body.post).toHaveProperty('author', 'user1');
  });

  // Test 3: Unauthenticated should not create post
  test('POST /posts - Unauthenticated should not create post', async () => {
    const response = await request(app)
      .post('/posts')
      .send({
        title: 'Unauthorized Post',
        content: 'This should fail'
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Authentication required');
  });

  // Test 4: User can edit own post
  test('PUT /posts/:id - User can edit own post', async () => {
    // Create post
    const createRes = await userAgent
      .post('/posts')
      .send({
        title: 'Original Title',
        content: 'Original content'
      });

    const postId = createRes.body.post.id;

    // Edit post
    const editRes = await userAgent
      .put(`/posts/${postId}`)
      .send({
        title: 'Updated Title',
        content: 'Updated content'
      });

    expect(editRes.statusCode).toBe(200);
    expect(editRes.body.post).toHaveProperty('title', 'Updated Title');
  });

  // Test 5: User cannot edit other user's post
  test('PUT /posts/:id - User cannot edit other user post', async () => {
    // Create post as user1
    const createRes = await userAgent
      .post('/posts')
      .send({
        title: 'User1 Post',
        content: 'This is user1 post'
      });

    const postId = createRes.body.post.id;

    // Try to edit as different user
    const otherUserAgent = request.agent(app);
    await otherUserAgent.post('/login').send({ username: 'user1' });

    const editRes = await otherUserAgent
      .put(`/posts/${postId}`)
      .send({
        title: 'Hacked Title',
        content: 'Hacked content'
      });

    expect(editRes.statusCode).toBe(403);
    expect(editRes.body).toHaveProperty('error', 'Insufficient permissions');
  });

  // Test 6: Moderator can edit any post
  test('PUT /posts/:id - Moderator can edit any post', async () => {
    // Create post as user
    const createRes = await userAgent
      .post('/posts')
      .send({
        title: 'User Post',
        content: 'User content'
      });

    const postId = createRes.body.post.id;

    // Edit as moderator
    const editRes = await moderatorAgent
      .put(`/posts/${postId}`)
      .send({
        title: 'Moderated Title',
        content: 'Moderated content'
      });

    expect(editRes.statusCode).toBe(200);
    expect(editRes.body.post).toHaveProperty('editedBy', 'moderator');
  });

  // Test 7: Only moderator/admin can delete posts
  test('DELETE /posts/:id - User cannot delete post', async () => {
    // Create post
    const createRes = await userAgent
      .post('/posts')
      .send({
        title: 'Should Delete',
        content: 'To be deleted'
      });

    const postId = createRes.body.post.id;

    // Try to delete as regular user
    const deleteRes = await userAgent.delete(`/posts/${postId}`);

    expect(deleteRes.statusCode).toBe(403);
    expect(deleteRes.body).toHaveProperty('error', 'Insufficient permissions');
  });

  test('DELETE /posts/:id - Moderator can delete post', async () => {
    // Create post as user
    const createRes = await userAgent
      .post('/posts')
      .send({
        title: 'Delete by Mod',
        content: 'To be deleted'
      });

    const postId = createRes.body.post.id;

    // Delete as moderator
    const deleteRes = await moderatorAgent.delete(`/posts/${postId}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty('message', 'Post deleted successfully');
  });

  // Test 8: Admin can manage users
  test('GET /admin/users - Admin can view all users', async () => {
    const response = await adminAgent.get('/admin/users');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('users');
    expect(response.body.users.length).toBeGreaterThan(0);
  });

  test('GET /admin/users - Non-admin cannot view users', async () => {
    const response = await userAgent.get('/admin/users');

    expect(response.statusCode).toBe(403);
  });

  // Test 9: Admin can change user roles
  test('PUT /admin/users/:id/role - Admin can update user role', async () => {
    const response = await adminAgent
      .put('/admin/users/3/role')
      .send({ role: 'moderator' });

    expect(response.statusCode).toBe(200);
    expect(response.body.user).toHaveProperty('role', 'moderator');
  });

  // Test 10: Admin can delete users
  test('DELETE /admin/users/:id - Admin can delete user', async () => {
    const response = await adminAgent.delete('/admin/users/3');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'User deleted successfully');
  });

  // Test 11: Get current user info
  test('GET /me - Should return current user', async () => {
    const response = await adminAgent.get('/me');

    expect(response.statusCode).toBe(200);
    expect(response.body.user).toHaveProperty('username', 'admin');
    expect(response.body.user).toHaveProperty('role', 'admin');
  });

  // Test 12: Logout
  test('POST /logout - Should logout user', async () => {
    const agent = request.agent(app);
    
    // Login
    await agent.post('/login').send({ username: 'admin' });

    // Logout
    const response = await agent.post('/logout');
    expect(response.statusCode).toBe(200);

    // Check not authenticated
    const meRes = await agent.get('/me');
    expect(meRes.statusCode).toBe(401);
  });
});
