import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

describe('Auth Middleware', () => {
  let token;

  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user (seeker)
    const user = new User({
      email: 'seeker@example.com',
      password: 'password123',
      role: 'seeker',
    });
    await user.save();

    // Generate a token for the test user
    token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  // Test: Allow access with a valid token
  it('should allow access with a valid token', async () => {
    const res = await request(app)
      .get('/api/profile') // Example protected route
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
  });

  // Test: Deny access without a token
  it('should deny access without a token', async () => {
    const res = await request(app)
      .get('/api/profile') // Example protected route
      .set('Authorization', ''); // No token provided

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Access denied. No token provided.');
  });

  // Test: Deny access with an invalid token
  it('should deny access with an invalid token', async () => {
    const res = await request(app)
      .get('/api/profile') // Example protected route
      .set('Authorization', 'Bearer invalidtoken'); // Invalid token

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid token');
  });

  // Test: Deny access with an expired token
  it('should deny access with an expired token', async () => {
    // Generate an expired token
    const expiredToken = jwt.sign(
      { id: '123', role: 'seeker' },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' } // Expired 1 hour ago
    );

    const res = await request(app)
      .get('/api/profile') // Example protected route
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Token expired');
  });

  // Test: Allow access to agent-only routes for agents
  it('should allow access to agent-only routes for agents', async () => {
    // Create a test user (agent)
    const agent = new User({
      email: 'agent@example.com',
      password: 'password123',
      role: 'agent',
    });
    await agent.save();

    // Generate a token for the agent
    const agentToken = jwt.sign(
      { id: agent._id, role: agent.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .post('/api/jobs') // Example agent-only route
      .set('Authorization', `Bearer ${agentToken}`)
      .send({
        title: 'Software Engineer',
        description: 'Develop awesome software',
        location: 'Remote',
        salary: 100000,
        type: 'full-time',
        remote: true,
        skills: ['JavaScript', 'Node.js'],
      });

    expect(res.statusCode).toEqual(201);
  });

  // Test: Deny access to agent-only routes for non-agents
  it('should deny access to agent-only routes for non-agents', async () => {
    const res = await request(app)
      .post('/api/jobs') // Example agent-only route
      .set('Authorization', `Bearer ${token}`) // Token for a seeker
      .send({
        title: 'Software Engineer',
        description: 'Develop awesome software',
        location: 'Remote',
        salary: 100000,
        type: 'full-time',
        remote: true,
        skills: ['JavaScript', 'Node.js'],
      });

    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('message', 'Only agents can access this resource');
  });
});