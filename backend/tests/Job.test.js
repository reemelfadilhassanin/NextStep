import mongoose from 'mongoose';
import Job from '../models/Job.js';
import User from '../models/User.js';

describe('Job Model', () => {
  let user;

  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user (agent)
    user = new User({
      email: 'agent@example.com',
      password: 'password123',
      role: 'agent',
    });
    await user.save();
  });

  afterEach(async () => {
    // Clean up the database after each test
    await Job.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  // Test: Create a new job
  it('should create a new job', async () => {
    const job = new Job({
      title: 'Software Engineer',
      description: 'Develop awesome software',
      location: 'Remote',
      salary: 100000,
      type: 'full-time',
      remote: true,
      skillsRequired: ['JavaScript', 'Node.js'],
      postedBy: user._id,
    });

    await job.save();

    const foundJob = await Job.findOne({ title: 'Software Engineer' });
    expect(foundJob).toHaveProperty('title', 'Software Engineer');
    expect(foundJob).toHaveProperty('location', 'Remote');
    expect(foundJob).toHaveProperty('postedBy', user._id);
  });

  // Test: Fail to create a job with missing required fields
  it('should not create a job with missing required fields', async () => {
    const job = new Job({
      // Missing title, description, location, salary, type, etc.
    });

    let error;
    try {
      await job.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.title).toBeDefined();
    expect(error.errors.description).toBeDefined();
    expect(error.errors.location).toBeDefined();
    expect(error.errors.salary).toBeDefined();
    expect(error.errors.type).toBeDefined();
  });

  // Test: Fail to create a job with an invalid type
  it('should not create a job with an invalid type', async () => {
    const job = new Job({
      title: 'Software Engineer',
      description: 'Develop awesome software',
      location: 'Remote',
      salary: 100000,
      type: 'invalidType', // Invalid type
      remote: true,
      skillsRequired: ['JavaScript', 'Node.js'],
      postedBy: user._id,
    });

    let error;
    try {
      await job.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.type).toBeDefined();
  });

  // Test: Update job details
  it('should update job details', async () => {
    const job = new Job({
      title: 'Software Engineer',
      description: 'Develop awesome software',
      location: 'Remote',
      salary: 100000,
      type: 'full-time',
      remote: true,
      skillsRequired: ['JavaScript', 'Node.js'],
      postedBy: user._id,
    });
    await job.save();

    job.title = 'Senior Software Engineer';
    job.salary = 120000;
    await job.save();

    const foundJob = await Job.findOne({ _id: job._id });
    expect(foundJob).toHaveProperty('title', 'Senior Software Engineer');
    expect(foundJob).toHaveProperty('salary', 120000);
  });

  // Test: Delete a job
  it('should delete a job', async () => {
    const job = new Job({
      title: 'Software Engineer',
      description: 'Develop awesome software',
      location: 'Remote',
      salary: 100000,
      type: 'full-time',
      remote: true,
      skillsRequired: ['JavaScript', 'Node.js'],
      postedBy: user._id,
    });
    await job.save();

    await Job.deleteOne({ _id: job._id });

    const foundJob = await Job.findOne({ _id: job._id });
    expect(foundJob).toBeNull();
  });
});