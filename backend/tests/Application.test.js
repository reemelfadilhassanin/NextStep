import mongoose from 'mongoose';
import Application from '../models/Application.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Profile from '../models/Profile.js';

describe('Application Model', () => {
  let user;
  let job;
  let profile;

  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user
    user = new User({
      email: 'seeker@example.com',
      password: 'password123',
      role: 'seeker',
    });
    await user.save();

    // Create a test job
    job = new Job({
      title: 'Software Engineer',
      description: 'Develop awesome software',
      location: 'Remote',
      salary: 100000,
      type: 'full-time',
      remote: true,
      skillsRequired: ['JavaScript', 'Node.js'],
      postedBy: 'agent@example.com',
    });
    await job.save();

    // Create a test profile
    profile = new Profile({
      user: user._id,
      fullName: 'John Doe',
      phone: '1234567890',
      bio: 'I am a software engineer',
      skills: ['JavaScript', 'Node.js'],
    });
    await profile.save();
  });

  afterEach(async () => {
    // Clean up the database after each test
    await Application.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  // Test: Create a new application
  it('should create a new application', async () => {
    const application = new Application({
      job: job._id,
      user: user._id,
      profile: profile._id,
      resume: 'uploads/resume.pdf',
      status: 'applied',
    });

    await application.save();

    const foundApplication = await Application.findOne({ user: user._id });
    expect(foundApplication).toHaveProperty('status', 'applied');
    expect(foundApplication).toHaveProperty('resume', 'uploads/resume.pdf');
  });

  // Test: Fail to create an application with missing required fields
  it('should not create an application with missing required fields', async () => {
    const application = new Application({
      // Missing job, user, profile, resume, and status
    });

    let error;
    try {
      await application.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.job).toBeDefined();
    expect(error.errors.user).toBeDefined();
    expect(error.errors.profile).toBeDefined();
    expect(error.errors.resume).toBeDefined();
    expect(error.errors.status).toBeDefined();
  });

  // Test: Fail to create an application with an invalid status
  it('should not create an application with an invalid status', async () => {
    const application = new Application({
      job: job._id,
      user: user._id,
      profile: profile._id,
      resume: 'uploads/resume.pdf',
      status: 'invalidStatus', // Invalid status
    });

    let error;
    try {
      await application.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.status).toBeDefined();
  });

  // Test: Update application status
  it('should update application status', async () => {
    const application = new Application({
      job: job._id,
      user: user._id,
      profile: profile._id,
      resume: 'uploads/resume.pdf',
      status: 'applied',
    });
    await application.save();

    application.status = 'approved';
    await application.save();

    const foundApplication = await Application.findOne({ user: user._id });
    expect(foundApplication).toHaveProperty('status', 'approved');
  });
});