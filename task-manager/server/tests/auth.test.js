process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jest-unit-tests';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');

// Mock User Model
jest.mock('../models/User');

describe('Auth & System API Endpoints (CI/CD Suite)', () => {
  let authToken;
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'auth_test@example.com',
    createdAt: new Date().toISOString()
  };

  beforeAll(() => {
    authToken = jwt.sign(
      { id: mockUser._id, email: mockUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('1. POST /register with missing email returns 400', async () => {
    const res = await request(app)
      .post('/register')
      .set('Content-Type', 'application/json')
      .send({ password: 'Password123!' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('2. POST /login with non-existent email returns 401', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'ghost@example.com', password: 'Password123!' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Invalid email or password');
  });

  test('3. GET /me with valid token returns authenticated user', async () => {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    const res = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(mockUser.email);
  });

  test('4. GET /debug/cache with valid token returns cache status metrics', async () => {
    const res = await request(app)
      .get('/debug/cache')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('hits');
    expect(res.body).toHaveProperty('misses');
    expect(res.body).toHaveProperty('enabled');
  });
});
