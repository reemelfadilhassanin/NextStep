import request from 'supertest';
import app from '../app'; // Assuming your main server file is app.js
import mongoose from 'mongoose';
import Profile from '../models/Profile.js';
import User from '../models/User.js'; // Assuming you have a User model
import path from 'path';

let token;
let user;
let profile;

beforeAll(async () => {
  // Create a user and obtain token for authentication
  user = new User({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'seeker',
  });
  await user.save();

  // Assuming you have a method to generate JWT token
  token = 'your_generated_jwt_token'; // Replace with an actual token generation mechanism
});

afterAll(async () => {
  // Clean up test data
  await User.deleteMany({});
  await Profile.deleteMany({});
});

describe('Profile Controller Tests', () => {
  it('should create a profile for the user', async () => {
    const res = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .field('fullName', 'Test User')
      .field('phone', '1234567890')
      .field('bio', 'Test bio')
      .field('skills', JSON.stringify(['JavaScript', 'Node.js']))
      .field('address', 'Test Address')
      .attach('profileImage', path.join(__dirname, '/test-image.jpg')) // Sample image for testing
      .attach('resume', path.join(__dirname, '/test-resume.pdf')); // Sample resume

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Profile created successfully');
    expect(res.body.profile).toHaveProperty('fullName', 'Test User');
    profile = res.body.profile; // Save the profile ID for further tests
  });

  it('should return an error if profile already exists', async () => {
    const res = await request(app)
      .post('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .field('fullName', 'Test User')
      .field('phone', '1234567890')
      .field('bio', 'Test bio')
      .field('skills', JSON.stringify(['JavaScript', 'Node.js']))
      .field('address', 'Test Address');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Profile already exists. You cannot create a new one.');
  });
  
  // More tests can follow as described in the previous Mocha examples...
});
