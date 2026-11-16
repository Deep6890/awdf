process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jest-unit-tests';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const cache = require('../cache/cache');
const Task = require('../models/Task');

// Mock Mongoose Task Model
jest.mock('../models/Task');

describe('Task API Endpoints (CI/CD Suite)', () => {
  let authToken;
  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    email: 'tester@example.com'
  };

  beforeAll(() => {
    authToken = jwt.sign(mockUser, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  beforeEach(() => {
    cache.flush();
    jest.clearAllMocks();
  });

  test('1. GET /health returns 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('2. GET /tasks without token returns 401 Unauthorized', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('3. GET /tasks with valid JWT returns 200 and mocked tasks array', async () => {
    const mockTasks = [
      { _id: '507f1f77bcf86cd799439012', title: 'CI Task 1', completed: false, priority: 'high' },
      { _id: '507f1f77bcf86cd799439013', title: 'CI Task 2', completed: true, priority: 'medium' }
    ];

    Task.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockTasks)
      })
    });

    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0].title).toBe('CI Task 1');
  });

  test('4. POST /tasks with missing title returns 400 Bad Request', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Content-Type', 'application/json')
      .send({ description: 'No title given' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('5. GET /unknown-route returns 404 JSON', async () => {
    const res = await request(app).get('/non-existent-api-path');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Route not found');
  });
});
