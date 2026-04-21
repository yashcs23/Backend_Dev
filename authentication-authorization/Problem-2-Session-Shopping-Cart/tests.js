const request = require('supertest');
const app = require('./app');

describe('Session-Based Shopping Cart', () => {
  // Test 1: Add item to cart
  test('POST /cart/add - Should add item to cart', async () => {
    const response = await request(app)
      .post('/cart/add')
      .send({
        productId: 1,
        quantity: 2
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Item added to cart');
    expect(response.body.cart).toHaveLength(1);
    expect(response.body.cart[0]).toHaveProperty('id', 1);
    expect(response.body.cart[0]).toHaveProperty('quantity', 2);
    expect(response.body).toHaveProperty('total');
  });

  // Test 2: Get cart
  test('GET /cart - Should retrieve cart', async () => {
    const agent = request.agent(app);

    // Add item first
    await agent
      .post('/cart/add')
      .send({ productId: 1, quantity: 1 });

    // Get cart
    const response = await agent.get('/cart');

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('cart');
    expect(response.body).toHaveProperty('itemCount');
    expect(response.body).toHaveProperty('total');
  });

  // Test 3: Update item quantity
  test('PUT /cart/update/:productId - Should update item quantity', async () => {
    const agent = request.agent(app);

    // Add item
    await agent
      .post('/cart/add')
      .send({ productId: 1, quantity: 2 });

    // Update quantity
    const response = await agent
      .put('/cart/update/1')
      .send({ quantity: 5 });

    expect(response.statusCode).toBe(200);
    expect(response.body.cart[0]).toHaveProperty('quantity', 5);
  });

  // Test 4: Remove item from cart
  test('DELETE /cart/remove/:productId - Should remove item', async () => {
    const agent = request.agent(app);

    // Add item
    await agent
      .post('/cart/add')
      .send({ productId: 1, quantity: 2 });

    // Remove item
    const response = await agent.delete('/cart/remove/1');

    expect(response.statusCode).toBe(200);
    expect(response.body.cart).toHaveLength(0);
  });

  // Test 5: Clear cart
  test('DELETE /cart - Should clear entire cart', async () => {
    const agent = request.agent(app);

    // Add multiple items
    await agent
      .post('/cart/add')
      .send({ productId: 1, quantity: 2 });

    await agent
      .post('/cart/add')
      .send({ productId: 2, quantity: 1 });

    // Clear cart
    const response = await agent.delete('/cart');

    expect(response.statusCode).toBe(200);
    expect(response.body.cart).toHaveLength(0);
    expect(response.body).toHaveProperty('total', '0.00');
  });

  // Test 6: Add multiple items and verify total
  test('POST /cart/add - Multiple items should calculate correct total', async () => {
    const agent = request.agent(app);

    // Add Laptop (999.99) x 1
    await agent
      .post('/cart/add')
      .send({ productId: 1, quantity: 1 });

    // Add Mouse (29.99) x 2
    const response = await agent
      .post('/cart/add')
      .send({ productId: 2, quantity: 2 });

    expect(response.statusCode).toBe(200);
    expect(response.body.cart).toHaveLength(2);
    // Total: 999.99 + (29.99 * 2) = 1059.97
    expect(response.body).toHaveProperty('total', '1059.97');
  });

  // Test 7: Invalid quantity
  test('POST /cart/add - Invalid quantity should return error', async () => {
    const response = await request(app)
      .post('/cart/add')
      .send({
        productId: 1,
        quantity: -1
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  // Test 8: Product not found
  test('POST /cart/add - Non-existent product should return 404', async () => {
    const response = await request(app)
      .post('/cart/add')
      .send({
        productId: 999,
        quantity: 1
      });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('error', 'Product not found');
  });

  // Test 9: Insufficient stock
  test('POST /cart/add - Insufficient stock should return error', async () => {
    const response = await request(app)
      .post('/cart/add')
      .send({
        productId: 1,
        quantity: 100 // Laptop stock is only 10
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  // Test 10: Add same item twice
  test('POST /cart/add - Adding same item twice should increase quantity', async () => {
    const agent = request.agent(app);

    // Add item first time
    await agent
      .post('/cart/add')
      .send({ productId: 1, quantity: 2 });

    // Add same item second time
    const response = await agent
      .post('/cart/add')
      .send({ productId: 1, quantity: 3 });

    expect(response.statusCode).toBe(200);
    expect(response.body.cart).toHaveLength(1);
    expect(response.body.cart[0]).toHaveProperty('quantity', 5);
  });

  // Test 11: Session persistence
  test('GET /cart - Cart should persist across requests', async () => {
    const agent = request.agent(app);

    // Add item
    await agent
      .post('/cart/add')
      .send({ productId: 1, quantity: 1 });

    // First request to get cart
    const response1 = await agent.get('/cart');
    expect(response1.body.cart).toHaveLength(1);

    // Second request to get cart (same session)
    const response2 = await agent.get('/cart');
    expect(response2.body.cart).toHaveLength(1);
  });

  // Test 12: Update to zero quantity removes item
  test('PUT /cart/update/:productId - Updating to 0 should remove item', async () => {
    const agent = request.agent(app);

    // Add item
    await agent
      .post('/cart/add')
      .send({ productId: 1, quantity: 2 });

    // Update to 0
    const response = await agent
      .put('/cart/update/1')
      .send({ quantity: 0 });

    expect(response.statusCode).toBe(200);
    expect(response.body.cart).toHaveLength(0);
  });
});
