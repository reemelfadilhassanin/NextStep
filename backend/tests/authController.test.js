import request from 'supertest';
import app from '../server.js'; 
import mongoose from 'mongoose';
import User from '../models/User.js';

describe('Auth Controller', () => {
  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(async () => {
    // Clean up the database after each test
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  // Test: Register a new user
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        role: 'seeker',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('role', 'seeker');
  });

  // Test: Fail to register a user with missing fields
  it('should not register a user with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        // Missing password and role
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Email, password, and role are required.');
  });

  // Test: Fail to register a user with an existing email
  it('should not register a user with an existing email', async () => {
    // Create a user with the same email
    await User.create({
      email: 'test@example.com',
      password: 'password123',
      role: 'seeker',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        role: 'seeker',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'User already exists.');
  });

  // Test: Login an existing user
  it('should login an existing user', async () => {
    // Create a user to log in
    await User.create({
      email: 'test@example.com',
      password: 'password123',
      role: 'seeker',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('role', 'seeker');
  });

  // Test: Fail to login with invalid credentials
  it('should not login with invalid credentials', async () => {
    // Create a user to log in
    await User.create({
      email: 'test@example.com',
      password: 'password123',
      role: 'seeker',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword', // Incorrect password
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid credentials.');
  });

  // Test: Fail to login with missing fields
  it('should not login with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        // Missing password
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Email and password are required.');
  });
});