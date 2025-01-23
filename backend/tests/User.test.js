import mongoose from 'mongoose';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('User Model', () => {
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

  // Test: Create a new user
  it('should create a new user', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      role: 'seeker',
    });

    await user.save();

    const foundUser = await User.findOne({ email: 'test@example.com' });
    expect(foundUser).toHaveProperty('email', 'test@example.com');
    expect(foundUser).toHaveProperty('role', 'seeker');
  });

  // Test: Fail to create a user with missing required fields
  it('should not create a user with missing required fields', async () => {
    const user = new User({
      // Missing email, password, and role
    });

    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
    expect(error.errors.role).toBeDefined();
  });

  // Test: Fail to create a user with an invalid email
  it('should not create a user with an invalid email', async () => {
    const user = new User({
      email: 'invalid-email', // Invalid email
      password: 'password123',
      role: 'seeker',
    });

    let error;
    try {
      await user.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.email).toBeDefined();
  });

  // Test: Hash password before saving
  it('should hash the password before saving', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      role: 'seeker',
    });

    await user.save();

    const foundUser = await User.findOne({ email: 'test@example.com' });
    expect(foundUser.password).not.toBe('password123'); // Password should be hashed
    expect(await bcrypt.compare('password123', foundUser.password)).toBe(true); // Verify hashed password
  });

  // Test: Compare password
  it('should compare the password correctly', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      role: 'seeker',
    });

    await user.save();

    const isMatch = await user.comparePassword('password123');
    expect(isMatch).toBe(true);

    const isNotMatch = await user.comparePassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });

  // Test: Generate auth token
  it('should generate an auth token', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
      role: 'seeker',
    });

    await user.save();

    const token = user.generateAuthToken();
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded).toHaveProperty('id', user._id.toString());
    expect(decoded).toHaveProperty('role', 'seeker');
  });
});