import request from 'supertest';
import app from '../server.js'; 
import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Profile from '../models/Profile.js';

describe('Application Controller', () => {
  let token;
  let jobId;
  let profileId;
  let applicationId;

  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user (job seeker)
    const user = new User({
      email: 'seeker@example.com',
      password: 'password123',
      role: 'seeker',
    });
    await user.save();

    // Create a test user (agent)
    const agent = new User({
      email: 'agent@example.com',
      password: 'password123',
      role: 'agent',
    });
    await agent.save();

    // Login as the job seeker to get a token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'seeker@example.com',
        password: 'password123',
      });
    token = loginResponse.body.token;

    // Create a test job
    const job = new Job({
      title: 'Software Engineer',
      description: 'Develop awesome software',
      location: 'Remote',
      salary: 100000,
      type: 'full-time',
      remote: true,
      skillsRequired: ['JavaScript', 'Node.js'],
      postedBy: agent._id,
    });
    await job.save();
    jobId = job._id;

    // Create a test profile for the job seeker
    const profile = new Profile({
      user: user._id,
      fullName: 'John Doe',
      phone: '1234567890',
      bio: 'I am a software engineer',
      skills: ['JavaScript', 'Node.js'],
    });
    await profile.save();
    profileId = profile._id;
  });

  afterEach(async () => {
    // Clean up the database after each test
    await Application.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  // Test: Apply for a job
  it('should apply for a job', async () => {
    const res = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set('Authorization', `Bearer ${token}`)
      .attach('resume', 'tests/test-resume.pdf') // Attach a test resume file
      .field('experience', JSON.stringify([{ years: 2, role: 'Developer' }]))
      .field('education', JSON.stringify([{ degree: 'BSc', university: 'XYZ' }]))
      .field('skills', JSON.stringify(['JavaScript', 'Node.js']))
      .field('socialLinks', JSON.stringify({ linkedin: 'https://linkedin.com' }));

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Application submitted successfully');
    expect(res.body.application).toHaveProperty('status', 'applied');

    // Save the application ID for later tests
    applicationId = res.body.application._id;
  });

  // Test: Fail to apply for a job without a resume
  it('should not apply for a job without a resume', async () => {
    const res = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set('Authorization', `Bearer ${token}`)
      .field('experience', JSON.stringify([{ years: 2, role: 'Developer' }]))
      .field('education', JSON.stringify([{ degree: 'BSc', university: 'XYZ' }]))
      .field('skills', JSON.stringify(['JavaScript', 'Node.js']))
      .field('socialLinks', JSON.stringify({ linkedin: 'https://linkedin.com' }));

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Resume file is required.');
  });

  // Test: Update application status
  it('should update application status', async () => {
    // Create a test application
    const application = new Application({
      job: jobId,
      user: 'seeker@example.com',
      profile: profileId,
      resume: 'uploads/resume.pdf',
      status: 'applied',
    });
    await application.save();

    // Login as the agent to get a token
    const agentLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'agent@example.com',
        password: 'password123',
      });
    const agentToken = agentLoginResponse.body.token;

    // Update the application status
    const res = await request(app)
      .put(`/api/applications/${application._id}/status`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ status: 'approved' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Application status updated successfully');
    expect(res.body.application).toHaveProperty('status', 'approved');
  });

  // Test: Fail to update application status with invalid status
  it('should not update application status with invalid status', async () => {
    // Create a test application
    const application = new Application({
      job: jobId,
      user: 'seeker@example.com',
      profile: profileId,
      resume: 'uploads/resume.pdf',
      status: 'applied',
    });
    await application.save();

    // Login as the agent to get a token
    const agentLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'agent@example.com',
        password: 'password123',
      });
    const agentToken = agentLoginResponse.body.token;

    // Attempt to update the application status with an invalid value
    const res = await request(app)
      .put(`/api/applications/${application._id}/status`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({ status: 'invalidStatus' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid status value.');
  });

  // Test: Get application details
  it('should get application details', async () => {
    // Create a test application
    const application = new Application({
      job: jobId,
      user: 'seeker@example.com',
      profile: profileId,
      resume: 'uploads/resume.pdf',
      status: 'applied',
    });
    await application.save();

    // Login as the agent to get a token
    const agentLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'agent@example.com',
        password: 'password123',
      });
    const agentToken = agentLoginResponse.body.token;

    // Fetch the application details
    const res = await request(app)
      .get(`/api/applications/${application._id}`)
      .set('Authorization', `Bearer ${agentToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id', application._id.toString());
    expect(res.body).toHaveProperty('status', 'applied');
  });
});