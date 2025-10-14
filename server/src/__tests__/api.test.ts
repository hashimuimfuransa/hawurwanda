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
