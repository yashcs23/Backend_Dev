const request = require('supertest');
const app = require('./app');

describe('User Registration API', () => {
  // Test 1: Valid registration
  test('POST /register - Valid registration should return 201', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'john_doe',
        email: 'john@example.com',
        password: 'SecurePass123!'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('message', 'User registered successfully');
    expect(response.body.user).toHaveProperty('username', 'john_doe');
    expect(response.body.user).toHaveProperty('email', 'john@example.com');
    expect(response.body.user).not.toHaveProperty('password');
  });

  // Test 2: Weak password - too short
  test('POST /register - Weak password (too short) should return 400', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'jane',
        email: 'jane@example.com',
        password: 'weak'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  // Test 3: Duplicate email
  test('POST /register - Duplicate email should return 409', async () => {
    // First registration
    await request(app)
      .post('/register')
      .send({
        username: 'user1',
        email: 'test@example.com',
        password: 'SecurePass123!'
      });

    // Duplicate registration
    const response = await request(app)
      .post('/register')
      .send({
        username: 'user2',
        email: 'test@example.com',
        password: 'SecurePass123!'
      });

    expect(response.statusCode).toBe(409);
    expect(response.body).toHaveProperty('error', 'Email already registered');
  });

  // Test 4: Missing required fields
  test('POST /register - Missing required fields should return 400', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'incomplete',
        email: 'test@example.com'
        // missing password
      });

    expect(response.statusCode).toBe(400);
  });

  // Test 5: Invalid email format
  test('POST /register - Invalid email format should return 400', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'invalid-email',
        password: 'SecurePass123!'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  // Test 6: Password missing uppercase
  test('POST /register - Password missing uppercase should return 400', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'securepass123!'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.details).toContain('Password must contain at least one uppercase letter');
  });

  // Test 7: Password missing lowercase
  test('POST /register - Password missing lowercase should return 400', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'SECUREPASS123!'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.details).toContain('Password must contain at least one lowercase letter');
  });

  // Test 8: Password missing number
  test('POST /register - Password missing number should return 400', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass!'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.details).toContain('Password must contain at least one number');
  });

  // Test 9: Password missing special character
  test('POST /register - Password missing special character should return 400', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'SecurePass123'
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.details).toContain('Password must contain at least one special character');
  });

  // Test 10: Duplicate username
  test('POST /register - Duplicate username should return 409', async () => {
    // First registration
    await request(app)
      .post('/register')
      .send({
        username: 'unique_user',
        email: 'first@example.com',
        password: 'SecurePass123!'
      });

    // Duplicate username
    const response = await request(app)
      .post('/register')
      .send({
        username: 'unique_user',
        email: 'second@example.com',
        password: 'SecurePass123!'
      });

    expect(response.statusCode).toBe(409);
    expect(response.body).toHaveProperty('error', 'Username already taken');
  });
});
