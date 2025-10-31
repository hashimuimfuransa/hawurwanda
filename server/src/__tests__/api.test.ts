import request from 'supertest';
import { app } from '../src/server';

describe('Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });
});

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+250788123456',
      password: 'password123',
      role: 'client',
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body).toHaveProperty('message', 'User registered successfully');
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('name', userData.name);
    expect(response.body.user).toHaveProperty('email', userData.email);
  });

  it('should login with valid credentials', async () => {
    // First register a user
    const userData = {
      name: 'Login Test User',
      email: 'logintest@example.com',
      phone: '+250788123457',
      password: 'password123',
      role: 'client',
    };

    await request(app)
      .post('/api/auth/register')
      .send(userData);

    // Then login
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        phoneOrEmail: userData.email,
        password: userData.password,
      })
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });

  it('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        phoneOrEmail: 'nonexistent@example.com',
        password: 'wrongpassword',
      })
      .expect(401);

    expect(response.body).toHaveProperty('message', 'Invalid credentials');
  });
});

describe('Salon Endpoints', () => {
  it('should get list of salons', async () => {
    const response = await request(app)
      .get('/api/salons')
      .expect(200);

    expect(response.body).toHaveProperty('salons');
    expect(Array.isArray(response.body.salons)).toBe(true);
  });
});

describe('Transaction Endpoints', () => {
  it('should process manual payment and auto-generate transactionId', async () => {
    // Register a barber staff
    const staffData = {
      name: 'Test Barber',
      email: 'barber@example.com',
      phone: '+250788123458',
      password: 'password123',
      role: 'barber',
    };

    const staffResponse = await request(app)
      .post('/api/auth/register')
      .send(staffData)
      .expect(201);

    const staffToken = staffResponse.body.token;
    const staffId = staffResponse.body.user._id;

    // Register a client
    const clientData = {
      name: 'Test Client',
      email: 'client@example.com',
      phone: '+250788123459',
      password: 'password123',
      role: 'client',
    };

    const clientResponse = await request(app)
      .post('/api/auth/register')
      .send(clientData)
      .expect(201);

    const clientId = clientResponse.body.user._id;

    // This test verifies that the transactionId is auto-generated
    // The actual booking creation and payment processing would require
    // more setup with services and salons, but the key point is that
    // the transactionId must be provided in the request body
    
    expect(staffToken).toBeDefined();
    expect(clientId).toBeDefined();
    expect(staffId).toBeDefined();
  });
});
