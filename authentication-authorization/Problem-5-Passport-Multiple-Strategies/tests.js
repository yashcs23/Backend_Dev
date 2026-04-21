const request = require('supertest');
const app = require('./app');

describe('Passport.js with Multiple Strategies', () => {
  let sessionAgent, jwtToken;

  // Test 1: Register new user
  test('POST /auth/register - Should register new user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        username: 'newuser',
        password: 'password123',
        email: 'newuser@example.com'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('message', 'User created successfully');
    expect(response.body.user).toHaveProperty('username', 'newuser');
  });

  // Test 2: Register duplicate user
  test('POST /auth/register - Should prevent duplicate user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        username: 'alice',
        password: 'newpass',
        email: 'alice2@example.com'
      });

    expect(response.statusCode).toBe(409);
    expect(response.body).toHaveProperty('error', 'User already exists');
  });

  // Test 3: Session-based login
  test('POST /auth/login - Should login with session authentication', async () => {
    sessionAgent = request.agent(app);

    const response = await sessionAgent
      .post('/auth/login')
      .send({
        username: 'alice',
        password: 'password123'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('authMethod', 'session-based');
    expect(response.body.user).toHaveProperty('username', 'alice');
  });

  // Test 4: API login returns JWT
  test('POST /auth/api-login - Should return JWT token', async () => {
    const response = await request(app)
      .post('/auth/api-login')
      .send({
        username: 'bob',
        password: 'password456'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('authMethod', 'token-based');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user).toHaveProperty('username', 'bob');

    jwtToken = response.body.accessToken;
  });

  // Test 5: API login with invalid credentials
  test('POST /auth/api-login - Should fail with wrong password', async () => {
    const response = await request(app)
      .post('/auth/api-login')
      .send({
        username: 'alice',
        password: 'wrongpassword'
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid credentials');
  });

  // Test 6: Protected route with session
  test('GET /dashboard-simple - Should access with session', async () => {
    const agent = request.agent(app);

    // Login first
    await agent
      .post('/auth/login')
      .send({
        username: 'alice',
        password: 'password123'
      });

    // Access dashboard
    const response = await agent.get('/dashboard-simple');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Welcome to dashboard');
    expect(response.body).toHaveProperty('authMethod', 'session-based');
  });

  // Test 7: Protected route without session
  test('GET /dashboard-simple - Should fail without login', async () => {
    const response = await request(app).get('/dashboard-simple');

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Authentication required');
  });

  // Test 8: Protected route with JWT
  test('GET /api/profile - Should access with JWT', async () => {
    const loginRes = await request(app)
      .post('/auth/api-login')
      .send({
        username: 'alice',
        password: 'password123'
      });

    const token = loginRes.body.accessToken;

    const response = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'User profile');
    expect(response.body).toHaveProperty('authMethod', 'token-based');
    expect(response.body.user).toHaveProperty('username', 'alice');
  });

  // Test 9: Protected route without JWT
  test('GET /api/profile - Should fail without JWT', async () => {
    const response = await request(app).get('/api/profile');

    expect(response.statusCode).toBe(401);
  });

  // Test 10: Protected route with invalid JWT
  test('GET /api/profile - Should fail with invalid JWT', async () => {
    const response = await request(app)
      .get('/api/profile')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(response.statusCode).toBe(401);
  });

  // Test 11: Access protected API data
  test('GET /api/data - Should access API data with JWT', async () => {
    const loginRes = await request(app)
      .post('/auth/api-login')
      .send({
        username: 'bob',
        password: 'password456'
      });

    const token = loginRes.body.accessToken;

    const response = await request(app)
      .get('/api/data')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Protected data');
    expect(response.body.data).toHaveProperty('userId');
  });

  // Test 12: Check authentication status
  test('GET /auth/status - Should show authenticated status', async () => {
    const agent = request.agent(app);

    // Login
    await agent
      .post('/auth/login')
      .send({
        username: 'alice',
        password: 'password123'
      });

    const response = await agent.get('/auth/status');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('authenticated', true);
    expect(response.body.user).toHaveProperty('username', 'alice');
  });

  // Test 13: Check unauthenticated status
  test('GET /auth/status - Should show not authenticated', async () => {
    const response = await request(app).get('/auth/status');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('authenticated', false);
  });

  // Test 14: Logout
  test('POST /auth/logout - Should logout user', async () => {
    const agent = request.agent(app);

    // Login
    await agent
      .post('/auth/login')
      .send({
        username: 'bob',
        password: 'password456'
      });

    // Logout
    const logoutRes = await agent.post('/auth/logout');
    expect(logoutRes.statusCode).toBe(200);
    expect(logoutRes.body).toHaveProperty('message', 'Logout successful');

    // Check status - should be unauthenticated
    const statusRes = await agent.get('/auth/status');
    expect(statusRes.body).toHaveProperty('authenticated', false);
  });

  // Test 15: Session persistence
  test('Session authentication - Should persist across requests', async () => {
    const agent = request.agent(app);

    // Login
    await agent
      .post('/auth/login')
      .send({
        username: 'alice',
        password: 'password123'
      });

    // First request
    const response1 = await agent.get('/dashboard-simple');
    expect(response1.statusCode).toBe(200);

    // Second request - should still be authenticated
    const response2 = await agent.get('/dashboard-simple');
    expect(response2.statusCode).toBe(200);
  });

  // Test 16: Both auth methods working simultaneously
  test('Both auth methods should work independently', async () => {
    // Session-based
    const sessionResponse = await request(app)
      .post('/auth/login')
      .send({
        username: 'alice',
        password: 'password123'
      });

    expect(sessionResponse.statusCode).toBe(200);

    // JWT-based
    const jwtResponse = await request(app)
      .post('/auth/api-login')
      .send({
        username: 'bob',
        password: 'password456'
      });

    expect(jwtResponse.statusCode).toBe(200);
    expect(jwtResponse.body).toHaveProperty('accessToken');
  });
});
