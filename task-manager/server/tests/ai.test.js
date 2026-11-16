process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jest-unit-tests';
process.env.GROQ_API_KEY = 'test_mock_groq_key_valid';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const aiRateLimit = require('../middleware/aiRateLimit');

describe('AI API Endpoints (Practical 13 Suite)', () => {
  let authToken;
  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    email: 'ai_tester@example.com'
  };

  beforeAll(() => {
    authToken = jwt.sign(mockUser, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  beforeEach(() => {
    aiRateLimit.reset();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('1. POST /api/ai/generate-description without token returns 401', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .set('Content-Type', 'application/json')
      .send({ title: 'Build CI Pipeline' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  test('2. POST /api/ai/generate-description with missing title returns 400', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Content-Type', 'application/json')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('3. Success path: returns generated description from Groq API', async () => {
    const mockGroqResponse = {
      choices: [
        {
          message: {
            content: 'Set up an automated GitHub Actions workflow to run linting and tests.'
          }
        }
      ]
    };

    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockGroqResponse)
    });

    const res = await request(app)
      .post('/api/ai/generate-description')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Content-Type', 'application/json')
      .send({ title: 'Configure CI Pipeline' });

    expect(res.status).toBe(200);
    expect(res.body.fallback).toBe(false);
    expect(res.body.description).toBe(
      'Set up an automated GitHub Actions workflow to run linting and tests.'
    );
  });

  test('4. Graceful degradation: Groq error or network rejection returns 200 with fallback: true', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network connection timeout'));

    const res = await request(app)
      .post('/api/ai/generate-description')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Content-Type', 'application/json')
      .send({ title: 'Fix CSS Layout' });

    expect(res.status).toBe(200);
    expect(res.body.fallback).toBe(true);
    expect(res.body.description).toBe('');
    expect(res.body).toHaveProperty('message');
  });

  test('5. Rate limiting: rapid second call with identical title returns 429', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'First response' } }]
      })
    });

    // First call succeeds
    const res1 = await request(app)
      .post('/api/ai/generate-description')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Content-Type', 'application/json')
      .send({ title: 'Duplicate Rate Limit Test' });

    expect(res1.status).toBe(200);

    // Immediate second call for same title gets 429
    const res2 = await request(app)
      .post('/api/ai/generate-description')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Content-Type', 'application/json')
      .send({ title: 'Duplicate Rate Limit Test' });

    expect(res2.status).toBe(429);
    expect(res2.body).toHaveProperty('error');
    expect(res2.body).toHaveProperty('retryAfterSeconds');
  });
});
