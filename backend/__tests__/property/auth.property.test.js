import fc from 'fast-check';
import request from 'supertest';
import express from 'express';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup.js';
import authRoutes from '../../routes/authRoutes.js';
import User from '../../models/User.js';

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
};

// Arbitraries for generating test data
const validUsernameArb = fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length >= 3);
const validEmailArb = fc.emailAddress();
const validPasswordArb = fc.string({ minLength: 6, maxLength: 30 });
const roleArb = fc.constantFrom('student', 'teacher');

const validUserArb = fc.record({
  username: validUsernameArb,
  email: validEmailArb,
  password: validPasswordArb,
  role: roleArb
});

describe('Authentication Property Tests', () => {
  let app;

  beforeAll(async () => {
    await setupTestDB();
    app = createTestApp();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  /**
   * **Feature: college-management, Property 1: Valid credentials authenticate successfully**
   * **Validates: Requirements 1.2**
   */
  describe('Property 1: Valid credentials authenticate successfully', () => {
    test('should authenticate any user with valid credentials', async () => {
      await fc.assert(
        fc.asyncProperty(validUserArb, async (userData) => {
          // Register user first
          const registerRes = await request(app)
            .post('/api/auth/register')
            .send(userData);

          expect(registerRes.status).toBe(201);
          expect(registerRes.body.success).toBe(true);
          expect(registerRes.body.token).toBeDefined();

          // Clear database to test login independently
          await clearTestDB();

          // Create user directly in database
          await User.create(userData);

          // Now test login
          const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
              email: userData.email,
              password: userData.password
            });

          expect(loginRes.status).toBe(200);
          expect(loginRes.body.success).toBe(true);
          expect(loginRes.body.token).toBeDefined();
          expect(loginRes.body.user).toBeDefined();
          expect(loginRes.body.user.email).toBe(userData.email.toLowerCase());
          expect(loginRes.body.user.role).toBe(userData.role);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: college-management, Property 2: Invalid credentials are rejected**
   * **Validates: Requirements 1.3**
   */
  describe('Property 2: Invalid credentials are rejected', () => {
    test('should reject login with wrong password', async () => {
      await fc.assert(
        fc.asyncProperty(
          validUserArb,
          validPasswordArb.filter(p => p.length >= 6),
          async (userData, wrongPassword) => {
            // Ensure wrong password is different
            fc.pre(wrongPassword !== userData.password);

            // Create user
            await User.create(userData);

            // Try to login with wrong password
            const loginRes = await request(app)
              .post('/api/auth/login')
              .send({
                email: userData.email,
                password: wrongPassword
              });

            expect(loginRes.status).toBe(401);
            expect(loginRes.body.success).toBe(false);
            expect(loginRes.body.message).toBe('Invalid credentials');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('should reject login with non-existent email', async () => {
      await fc.assert(
        fc.asyncProperty(
          validEmailArb,
          validPasswordArb,
          async (email, password) => {
            // Try to login with non-existent user
            const loginRes = await request(app)
              .post('/api/auth/login')
              .send({ email, password });

            expect(loginRes.status).toBe(401);
            expect(loginRes.body.success).toBe(false);
            expect(loginRes.body.message).toBe('Invalid credentials');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
