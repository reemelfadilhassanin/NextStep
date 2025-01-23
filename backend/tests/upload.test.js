import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

describe('Upload Middleware', () => {
  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  // Test: Upload a valid file (e.g., PDF)
  it('should upload a valid file', async () => {
    const res = await request(app)
      .post('/api/profile') // Example route that uses the upload middleware
      .attach('resume', 'tests/test-resume.pdf'); // Attach a test PDF file

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('profile');
    expect(res.body.profile).toHaveProperty('resume');
  });

  // Test: Upload a valid image file (e.g., JPEG)
  it('should upload a valid image file', async () => {
    const res = await request(app)
      .post('/api/profile') // Example route that uses the upload middleware
      .attach('profileImage', 'tests/test-image.jpg'); // Attach a test JPEG file

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('profile');
    expect(res.body.profile).toHaveProperty('profileImage');
  });

  // Test: Fail to upload an invalid file type (e.g., TXT)
  it('should not upload an invalid file type', async () => {
    const res = await request(app)
      .post('/api/profile') // Example route that uses the upload middleware
      .attach('resume', 'tests/invalid-file.txt'); // Attach a test TXT file

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid file type. Only JPEG, PNG, and PDF are allowed.');
  });

  // Test: Fail to upload a file that exceeds the size limit
  it('should not upload a file that exceeds the size limit', async () => {
    // Create a large file (greater than 10MB)
    const largeFilePath = 'tests/large-file.pdf';
    fs.writeFileSync(largeFilePath, Buffer.alloc(11 * 1024 * 1024)); // 11MB file

    const res = await request(app)
      .post('/api/profile') // Example route that uses the upload middleware
      .attach('resume', largeFilePath); // Attach the large file

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'File too large. Maximum size is 10MB.');

    // Clean up the large file
    fs.unlinkSync(largeFilePath);
  });
});