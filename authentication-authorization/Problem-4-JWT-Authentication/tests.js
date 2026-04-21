const request = require('supertest');
const app = require('./app');

describe('JWT Authentication with Refresh Tokens', () => {
  let accessToken, refreshToken;

  // Test 1: Login and get tokens
  test('POST /login - Should return access and refresh tokens', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'johndoe',
        email: 'john@example.com'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body).toHaveProperty('expiresIn', '15m');
    expect(response.body.user).toHaveProperty('username', 'johndoe');

    // Store tokens for later tests
    accessToken = response.body.accessToken;
    refreshToken = response.body.refreshToken;
  });

  // Test 2: Sample user login
  test('POST /login - Should login sample user', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'testuser',
        email: 'test@example.com'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  // Test 3: Access protected route with valid token
  test('GET /protected - Should access protected route with valid token', async () => {
    const loginRes = await request(app)
      .post('/login')
      .send({
        username: 'protecteduser',
        email: 'protected@example.com'
      });

    const token = loginRes.body.accessToken;

    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Access to protected route granted');
    expect(response.body.user).toHaveProperty('username', 'protecteduser');
  });

  // Test 4: Access protected route without token
  test('GET /protected - Should fail without token', async () => {
    const response = await request(app).get('/protected');

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'No token provided');
  });

  // Test 5: Access protected route with invalid token
  test('GET /protected - Should fail with invalid token', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty('error', 'Invalid token');
  });

  // Test 6: Refresh access token
  test('POST /token/refresh - Should return new access token', async () => {
    const loginRes = await request(app)
      .post('/login')
      .send({
        username: 'refreshuser',
        email: 'refresh@example.com'
      });

    const oldRefreshToken = loginRes.body.refreshToken;

    const response = await request(app)
      .post('/token/refresh')
      .send({
        refreshToken: oldRefreshToken
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Token refreshed successfully');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.refreshToken).not.toBe(oldRefreshToken);
  });

  // Test 7: Refresh token without token
  test('POST /token/refresh - Should fail without refresh token', async () => {
    const response = await request(app)
      .post('/token/refresh')
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error', 'Refresh token required');
  });

  // Test 8: Refresh token with invalid token
  test('POST /token/refresh - Should fail with invalid refresh token', async () => {
    const response = await request(app)
      .post('/token/refresh')
      .send({
        refreshToken: 'invalid.refresh.token'
      });

    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty('error', 'Invalid or revoked refresh token');
  });

  // Test 9: Logout and revoke refresh token
  test('POST /logout - Should revoke refresh token', async () => {
    const loginRes = await request(app)
      .post('/login')
      .send({
        username: 'logoutuser',
        email: 'logout@example.com'
      });

    const token = loginRes.body.refreshToken;

    const logoutRes = await request(app)
      .post('/logout')
      .send({ refreshToken: token });

    expect(logoutRes.statusCode).toBe(200);
    expect(logoutRes.body).toHaveProperty('message', 'Logout successful');

    // Try to use revoked token - should fail
    const refreshRes = await request(app)
      .post('/token/refresh')
      .send({ refreshToken: token });

    expect(refreshRes.statusCode).toBe(403);
    expect(refreshRes.body).toHaveProperty('error', 'Invalid or revoked refresh token');
  });

  // Test 10: Get user profile with token
  test('GET /profile - Should get user profile with valid token', async () => {
    const loginRes = await request(app)
      .post('/login')
      .send({
        username: 'profileuser',
        email: 'profile@example.com'
      });

    const token = loginRes.body.accessToken;

    const response = await request(app)
      .get('/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.user).toHaveProperty('username', 'profileuser');
    expect(response.body.user).toHaveProperty('email', 'profile@example.com');
  });

  // Test 11: Verify token
  test('POST /token/verify - Should verify valid token', async () => {
    const loginRes = await request(app)
      .post('/login')
      .send({
        username: 'verifyuser',
        email: 'verify@example.com'
      });

    const token = loginRes.body.accessToken;

    const response = await request(app)
      .post('/token/verify')
      .send({ token });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('valid', true);
    expect(response.body.user).toHaveProperty('username', 'verifyuser');
  });

  // Test 12: Verify invalid token
  test('POST /token/verify - Should detect invalid token', async () => {
    const response = await request(app)
      .post('/token/verify')
      .send({ token: 'invalid.token.here' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('valid', false);
  });

  // Test 13: Login without required fields
  test('POST /login - Should fail without username or email', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'onlyuser'
        // missing email
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  // Test 14: Token structure verification
  test('POST /login - Token should have correct structure', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'structureuser',
        email: 'structure@example.com'
      });

    const token = response.body.accessToken;
    const parts = token.split('.');

    // JWT should have 3 parts (header.payload.signature)
    expect(parts.length).toBe(3);
  });

  // Test 15: Refresh token rotation
  test('POST /token/refresh - Old refresh token should be invalid after refresh', async () => {
    const loginRes = await request(app)
      .post('/login')
      .send({
        username: 'rotationuser',
        email: 'rotation@example.com'
      });

    const oldRefreshToken = loginRes.body.refreshToken;

    // Refresh once
    const firstRefresh = await request(app)
      .post('/token/refresh')
      .send({ refreshToken: oldRefreshToken });

    expect(firstRefresh.statusCode).toBe(200);

    // Try to use old token again - should fail
    const secondAttempt = await request(app)
      .post('/token/refresh')
      .send({ refreshToken: oldRefreshToken });

    expect(secondAttempt.statusCode).toBe(403);
  });
});
