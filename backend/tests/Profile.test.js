import mongoose from 'mongoose';
import Profile from '../models/Profile.js';
import User from '../models/User.js';

describe('Profile Model', () => {
  let user;

  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user
    user = new User({
      email: 'test@example.com',
      password: 'password123',
      role: 'seeker',
    });
    await user.save();
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
    const profile = new Profile({
      user: user._id,
      fullName: 'John Doe',
      phone: '1234567890',
      bio: 'I am a software engineer',
      skills: ['JavaScript', 'Node.js'],
    });

    await profile.save();

    const foundProfile = await Profile.findOne({ user: user._id });
    expect(foundProfile).toHaveProperty('fullName', 'John Doe');
    expect(foundProfile).toHaveProperty('phone', '1234567890');
    expect(foundProfile).toHaveProperty('bio', 'I am a software engineer');
    expect(foundProfile).toHaveProperty('skills', ['JavaScript', 'Node.js']);
  });

  // Test: Fail to create a profile with missing required fields
  it('should not create a profile with missing required fields', async () => {
    const profile = new Profile({
      // Missing user, fullName, phone, bio, and skills
    });

    let error;
    try {
      await profile.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.user).toBeDefined();
    expect(error.errors.fullName).toBeDefined();
    expect(error.errors.phone).toBeDefined();
    expect(error.errors.bio).toBeDefined();
    expect(error.errors.skills).toBeDefined();
  });

  // Test: Fail to create a profile with invalid user ID
  it('should not create a profile with invalid user ID', async () => {
    const profile = new Profile({
      user: 'invalidUserId', // Invalid user ID
      fullName: 'John Doe',
      phone: '1234567890',
      bio: 'I am a software engineer',
      skills: ['JavaScript', 'Node.js'],
    });

    let error;
    try {
      await profile.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.user).toBeDefined();
  });

  // Test: Update profile details
  it('should update profile details', async () => {
    const profile = new Profile({
      user: user._id,
      fullName: 'John Doe',
      phone: '1234567890',
      bio: 'I am a software engineer',
      skills: ['JavaScript', 'Node.js'],
    });
    await profile.save();

    profile.fullName = 'Jane Doe';
    profile.bio = 'I am a senior software engineer';
    await profile.save();

    const foundProfile = await Profile.findOne({ user: user._id });
    expect(foundProfile).toHaveProperty('fullName', 'Jane Doe');
    expect(foundProfile).toHaveProperty('bio', 'I am a senior software engineer');
  });

  // Test: Delete a profile
  it('should delete a profile', async () => {
    const profile = new Profile({
      user: user._id,
      fullName: 'John Doe',
      phone: '1234567890',
      bio: 'I am a software engineer',
      skills: ['JavaScript', 'Node.js'],
    });
    await profile.save();

    await Profile.deleteOne({ user: user._id });

    const foundProfile = await Profile.findOne({ user: user._id });
    expect(foundProfile).toBeNull();
  });
});