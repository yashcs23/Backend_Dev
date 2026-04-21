const request = require('supertest');
const app = require('./app');

describe('Rate-Limited Login with Account Lockout', () => {
  const testEmail = 'testuser@example.com';
  const validEmail = 'alice@example.com';
  const validPassword = 'hashedPassword123';
  const wrongPassword = 'wrongpassword';

  // Test 1: Successful login with correct credentials
  test('POST /login - Should login with correct credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: validEmail,
        password: validPassword
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body.user).toHaveProperty('email', validEmail);
  });

  // Test 2: Login fails with incorrect password
  test('POST /login - Should fail with incorrect password', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: validEmail,
        password: wrongPassword
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid credentials');
    expect(response.body.attemptInfo).toHaveProperty('failedAttempts', 1);
  });

  // Test 3: Track failed attempts
  test('POST /login - Should track multiple failed attempts', async () => {
    let response;
    for (let i = 1; i <= 3; i++) {
      response = await request(app)
        .post('/login')
        .send({
          email: 'track@example.com',
          password: 'wrongpass'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.attemptInfo).toHaveProperty('failedAttempts', i);
      expect(response.body.attemptInfo).toHaveProperty('remainingAttempts', 5 - i);
    }
  });

  // Test 4: Account lockout after max attempts
  test('POST /login - Should lock account after 5 failed attempts', async () => {
    const lockoutEmail = 'lockout@example.com';

    // Make 5 failed attempts
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/login')
        .send({
          email: lockoutEmail,
          password: 'wrongpass'
        });
    }

    // 6th attempt should be locked
    const response = await request(app)
      .post('/login')
      .send({
        email: lockoutEmail,
        password: 'wrongpass'
      });

    expect(response.statusCode).toBe(429);
    expect(response.body).toHaveProperty('error', 'Account locked');
    expect(response.body).toHaveProperty('minutesRemaining');
  });

  // Test 5: Check account status
  test('POST /check-account-status - Should show account status', async () => {
    const response = await request(app)
      .post('/check-account-status')
      .send({
        email: validEmail
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('isLocked');
    expect(response.body).toHaveProperty('remainingAttempts');
  });

  // Test 6: Successful login clears attempts
  test('POST /login - Successful login clears failed attempts', async () => {
    const testEmail = 'cleartest@example.com';

    // Register first
    await request(app)
      .post('/register')
      .send({
        username: 'cleartest',
        email: testEmail,
        password: 'password123'
      });

    // Make a failed attempt
    await request(app)
      .post('/login')
      .send({
        email: testEmail,
        password: 'wrongpass'
      });

    // Now login with correct password
    const response = await request(app)
      .post('/login')
      .send({
        email: testEmail,
        password: 'password123'
      });

    expect(response.statusCode).toBe(200);

    // Check status - attempts should be cleared
    const statusRes = await request(app)
      .post('/check-account-status')
      .send({ email: testEmail });

    expect(statusRes.body).toHaveProperty('failedAttempts', 0);
  });

  // Test 7: Register new user
  test('POST /register - Should register new user', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('message', 'User registered successfully');
  });

  // Test 8: Prevent duplicate email registration
  test('POST /register - Should prevent duplicate email', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'otheruser',
        email: validEmail,
        password: 'password123'
      });

    expect(response.statusCode).toBe(409);
    expect(response.body).toHaveProperty('error', 'Email already registered');
  });

  // Test 9: Login without credentials
  test('POST /login - Should fail without email or password', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: validEmail
        // missing password
      });

    expect(response.statusCode).toBe(400);
  });

  // Test 10: Non-existent user
  test('POST /login - Should fail for non-existent user', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'anypassword'
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid credentials');
  });

  // Test 11: Get login attempts (admin)
  test('GET /admin/login-attempts - Should show login attempts', async () => {
    // First make some attempts
    await request(app)
      .post('/login')
      .send({
        email: 'admin-test@example.com',
        password: 'wrongpass'
      });

    const response = await request(app).get('/admin/login-attempts');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('totalEmailsTracked');
    expect(response.body).toHaveProperty('lockedAccounts');
    expect(response.body).toHaveProperty('attempts');
  });

  // Test 12: Reset lockout (admin)
  test('POST /admin/reset-user-lockout - Should clear lockout', async () => {
    const email = 'reset-test@example.com';

    // Lock the account
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/login')
        .send({ email, password: 'wrongpass' });
    }

    // Verify locked
    let statusRes = await request(app)
      .post('/check-account-status')
      .send({ email });

    expect(statusRes.body.isLocked).toBe(true);

    // Reset lockout
    const resetRes = await request(app)
      .post('/admin/reset-user-lockout')
      .send({ email });

    expect(resetRes.statusCode).toBe(200);

    // Verify unlocked
    statusRes = await request(app)
      .post('/check-account-status')
      .send({ email });

    expect(statusRes.body.isLocked).toBe(false);
  });

  // Test 13: Clear all attempts (admin)
  test('POST /admin/clear-attempts - Should clear all login attempts', async () => {
    // Make some attempts
    await request(app)
      .post('/login')
      .send({
        email: 'clear-all-1@example.com',
        password: 'wrongpass'
      });

    await request(app)
      .post('/login')
      .send({
        email: 'clear-all-2@example.com',
        password: 'wrongpass'
      });

    // Clear all
    const response = await request(app).post('/admin/clear-attempts');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('clearedCount');

    // Verify cleared
    const attemptsRes = await request(app).get('/admin/login-attempts');
    expect(attemptsRes.body.totalEmailsTracked).toBe(0);
  });

  // Test 14: Health check
  test('GET /health - Should return server health', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('config');
    expect(response.body.config).toHaveProperty('maxAttempts', 5);
  });

  // Test 15: Remaining attempts warning
  test('POST /login - Should show remaining attempts', async () => {
    const email = 'warning@example.com';

    // Make 4 failed attempts (should show warning)
    let response;
    for (let i = 0; i < 4; i++) {
      response = await request(app)
        .post('/login')
        .send({
          email,
          password: 'wrongpass'
        });
    }

    expect(response.statusCode).toBe(401);
    expect(response.body.attemptInfo).toHaveProperty('remainingAttempts', 1);
  });

  // Test 16: Error message for locked account
  test('POST /login - Locked account should show error message', async () => {
    const email = 'locked-msg@example.com';

    // Lock account
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/login')
        .send({
          email,
          password: 'wrongpass'
        });
    }

    // Try to login
    const response = await request(app)
      .post('/login')
      .send({
        email,
        password: 'anypassword'
      });

    expect(response.statusCode).toBe(429);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Account is locked');
  });

  // Test 17: Delete specific user's attempts
  test('DELETE /admin/login-attempts/:email - Should delete specific user attempts', async () => {
    const email = 'delete-test@example.com';

    // Make attempt
    await request(app)
      .post('/login')
      .send({
        email,
        password: 'wrongpass'
      });

    // Delete
    const response = await request(app).delete(
      `/admin/login-attempts/${encodeURIComponent(email)}`
    );

    expect(response.statusCode).toBe(200);

    // Verify deleted
    const statusRes = await request(app)
      .post('/check-account-status')
      .send({ email });

    expect(statusRes.body).toHaveProperty('failedAttempts', 0);
  });

  // Test 18: Get users list
  test('GET /users - Should return all users', async () => {
    const response = await request(app).get('/users');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
  });
});
