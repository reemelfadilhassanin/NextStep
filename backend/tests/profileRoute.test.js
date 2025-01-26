import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Profile from '../models/Profile.js';

describe('Profile Routes', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      role: 'seeker',
    });
    await user.save();
    userId = user._id;

    // Login as the user to get a token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    token = loginResponse.body.token;
  });

  afterEach(async () => {
    // Clean up the database after each test
    await Profile.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  // Test: Create a new profile
  it('should create a new profile', async () => {
    const res = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fullName: 'John Doe',
        phone: '1234567890',
        bio: 'I am a software engineer',
        skills: ['JavaScript', 'Node.js'],
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('profile');
    expect(res.body.profile).toHaveProperty('fullName', 'John Doe');
    expect(res.body.profile).toHaveProperty('bio', 'I am a software engineer');
  });

  // Test: Fail to create a profile with missing required fields
  it('should not create a profile with missing required fields', async () => {
    const res = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        // Missing fullName, phone, bio, and skills
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Missing required fields.');
  });

  // Test: Fetch the user's profile
  it('should fetch the user\'s profile', async () => {
    // Create a test profile
    const profile = new Profile({
      user: userId,
      fullName: 'John Doe',
      phone: '1234567890',
      bio: 'I am a software engineer',
      skills: ['JavaScript', 'Node.js'],
    });
    await profile.save();

    const res = await request(app)
      .get('/api/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('fullName', 'John Doe');
    expect(res.body).toHaveProperty('bio', 'I am a software engineer');
  });

  // Test: Update the user's profile
  it('should update the user\'s profile', async () => {
    // Create a test profile
    const profile = new Profile({
      user: userId,
      fullName: 'John Doe',
      phone: '1234567890',
      bio: 'I am a software engineer',
      skills: ['JavaScript', 'Node.js'],
    });
    await profile.save();

    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fullName: 'Jane Doe',
        bio: 'I am a senior software engineer',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Profile updated successfully');
    expect(res.body.profile).toHaveProperty('fullName', 'Jane Doe');
    expect(res.body.profile).toHaveProperty('bio', 'I am a senior software engineer');
  });

  // Test: Delete the user's profile
  it('should delete the user\'s profile', async () => {
    // Create a test profile
    const profile = new Profile({
      user: userId,
      fullName: 'John Doe',
      phone: '1234567890',
      bio: 'I am a software engineer',
      skills: ['JavaScript', 'Node.js'],
    });
    await profile.save();

    const res = await request(app)
      .delete('/api/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Profile deleted successfully');
  });

  // Test: Fail to delete a profile that does not exist
  it('should not delete a profile that does not exist', async () => {
    const res = await request(app)
      .delete('/api/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Profile not found');
  });
});