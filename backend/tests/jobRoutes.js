import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';

describe('Job Routes', () => {
  let token;
  let jobId;

  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user (agent)
    const user = new User({
      email: 'agent@example.com',
      password: 'password123',
      role: 'agent',
    });
    await user.save();

    // Login as the agent to get a token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'agent@example.com',
        password: 'password123',
      });
    token = loginResponse.body.token;
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
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
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
    expect(res.body).toHaveProperty('job');
    expect(res.body.job).toHaveProperty('title', 'Software Engineer');

    // Save the job ID for later tests
    jobId = res.body.job._id;
  });

  // Test: Fail to create a job with missing required fields
  it('should not create a job with missing required fields', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Software Engineer',
        // Missing description, location, salary, etc.
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Missing required fields.');
  });

  // Test: Update a job
  it('should update a job', async () => {
    // Create a job to update
    const job = new Job({
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

    const res = await request(app)
      .put(`/api/jobs/${job._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Senior Software Engineer',
        description: 'Develop awesome software',
        location: 'Remote',
        salary: 120000,
        type: 'full-time',
        remote: true,
        skills: ['JavaScript', 'Node.js', 'React'],
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Job updated successfully.');
    expect(res.body.job).toHaveProperty('title', 'Senior Software Engineer');
  });

  // Test: Fail to update a job with invalid status
  it('should not update a job with invalid status', async () => {
    // Create a job to update
    const job = new Job({
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

    const res = await request(app)
      .put(`/api/jobs/${job._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'invalidStatus', // Invalid status
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid status value.');
  });

  // Test: Delete a job
  it('should delete a job', async () => {
    // Create a job to delete
    const job = new Job({
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

    const res = await request(app)
      .delete(`/api/jobs/${job._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Job deleted successfully.');
  });

  // Test: Get all jobs
  it('should get all jobs', async () => {
    // Create a job to fetch
    const job = new Job({
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

    const res = await request(app)
      .get('/api/jobs')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Test: Apply for a job
  it('should apply for a job', async () => {
    // Create a job to apply for
    const job = new Job({
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

    // Create a test user (seeker)
    const seeker = new User({
      email: 'seeker@example.com',
      password: 'password123',
      role: 'seeker',
    });
    await seeker.save();

    // Login as the seeker to get a token
    const seekerLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'seeker@example.com',
        password: 'password123',
      });
    const seekerToken = seekerLoginResponse.body.token;

    const res = await request(app)
      .post(`/api/jobs/${job._id}/apply`)
      .set('Authorization', `Bearer ${seekerToken}`)
      .attach('resume', 'tests/test-resume.pdf') // Attach a test resume file
      .field('experience', JSON.stringify([{ years: 2, role: 'Developer' }]))
      .field('education', JSON.stringify([{ degree: 'BSc', university: 'XYZ' }]))
      .field('skills', JSON.stringify(['JavaScript', 'Node.js']))
      .field('socialLinks', JSON.stringify({ linkedin: 'https://linkedin.com' }));

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Application submitted successfully');
    expect(res.body.application).toHaveProperty('status', 'applied');
  });
});