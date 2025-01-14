import request from 'supertest';
import app from '../server';  // Assuming server.js or app.js is the entry point
import mongoose from 'mongoose';
import User from '../models/User';  // User model for mocking user data
import Profile from '../models/Profile';  // Assuming you have a Profile model
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const mockUserData = {
  email: 'testuser@example.com',
  password: 'password123',
  role: 'seeker',
};

const mockProfileData = {
  bio: 'This is a test bio',
  location: 'Test Location',
  skills: ['JavaScript', 'Node.js'],
};

const createToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

describe('Profile Routes', () => {
  let user, token;

  beforeAll(async () => {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    // Create a mock user
    user = new User(mockUserData);
    await user.save();

    // Create a token for authentication
    token = createToken(user);
  });

  afterAll(async () => {
    // Clean up the database and close the connection
    await Profile.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // Test creating a profile
  describe('POST /profile', () => {
    it('should create a new profile', async () => {
      const response = await request(app)
        .post('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .field('bio', mockProfileData.bio)
        .field('location', mockProfileData.location)
        .field('skills', mockProfileData.skills);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('bio', mockProfileData.bio);
      expect(response.body).toHaveProperty('location', mockProfileData.location);
    });

    it('should return error if user is not authenticated', async () => {
      const response = await request(app)
        .post('/api/profile')
        .send(mockProfileData);

      expect(response.status).toBe(401); // Unauthorized
      expect(response.body.message).toBe('No token, authorization denied');
    });
  });

  // Test getting the user's profile
  describe('GET /profile', () => {
    it('should get the user\'s profile', async () => {
      const profile = new Profile({
        user: user._id,
        ...mockProfileData,
      });
      await profile.save();

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bio', mockProfileData.bio);
      expect(response.body).toHaveProperty('location', mockProfileData.location);
    });

    it('should return error if user is not authenticated', async () => {
      const response = await request(app)
        .get('/api/profile');

      expect(response.status).toBe(401); // Unauthorized
      expect(response.body.message).toBe('No token, authorization denied');
    });
  });

  // Test updating the user's profile
  describe('PUT /profile', () => {
    it('should update the user\'s profile', async () => {
      const profile = new Profile({
        user: user._id,
        ...mockProfileData,
      });
      await profile.save();

      const updatedProfileData = {
        bio: 'Updated bio',
        location: 'Updated location',
        skills: ['JavaScript', 'React'],
      };

      const response = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .field('bio', updatedProfileData.bio)
        .field('location', updatedProfileData.location)
        .field('skills', updatedProfileData.skills);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bio', updatedProfileData.bio);
      expect(response.body).toHaveProperty('location', updatedProfileData.location);
    });

    it('should return error if user is not authenticated', async () => {
      const response = await request(app)
        .put('/api/profile')
        .send(mockProfileData);

      expect(response.status).toBe(401); // Unauthorized
      expect(response.body.message).toBe('No token, authorization denied');
    });
  });
});
