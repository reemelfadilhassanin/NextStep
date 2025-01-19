const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');  // Adjust path to your Express app

let mongoServer;

beforeAll(async () => {
  jest.setTimeout(120000);  // Set timeout for tests to 120 seconds
  console.log("Starting MongoDB in-memory server...");
  
  try {
    mongoServer = await MongoMemoryServer.create();  // Start in-memory MongoDB
    const mongoUri = mongoServer.getUri();  // Get the URI for MongoDB connection

    console.log("MongoDB connected successfully");
    process.env.MONGODB_URI = mongoUri;  // Set the MongoDB URI for the app to connect to

    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });  // Connect mongoose to the in-memory DB
  } catch (err) {
    console.error("Error starting MongoDB in-memory server:", err);
    throw err;
  }
}, 120000);  // Ensure the setup has enough time to complete (120 seconds)

afterAll(async () => {
  if (mongoServer) {
    await mongoose.disconnect();  // Disconnect mongoose after tests are complete
    await mongoServer.stop();  // Stop the in-memory server
    console.log("MongoDB in-memory server stopped.");
  }
});

describe('Authentication Routes', () => {
  it('should register a new user', async () => {
    // Your registration test logic here
  });

  it('should log in an existing user', async () => {
    // Your login test logic here
  });

  it('should fail to log in with incorrect password', async () => {
    // Your failed login test logic here
  });
});

