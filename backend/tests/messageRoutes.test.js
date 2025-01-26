import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Message from '../models/Message.js';

describe('Message Routes', () => {
  let senderToken;
  let receiverToken;
  let senderId;
  let receiverId;

  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test sender user
    const sender = new User({
      email: 'sender@example.com',
      password: 'password123',
      role: 'seeker',
    });
    await sender.save();
    senderId = sender._id;

    // Create a test receiver user
    const receiver = new User({
      email: 'receiver@example.com',
      password: 'password123',
      role: 'agent',
    });
    await receiver.save();
    receiverId = receiver._id;

    // Login as the sender to get a token
    const senderLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'sender@example.com',
        password: 'password123',
      });
    senderToken = senderLoginResponse.body.token;

    // Login as the receiver to get a token
    const receiverLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'receiver@example.com',
        password: 'password123',
      });
    receiverToken = receiverLoginResponse.body.token;
  });

  afterEach(async () => {
    // Clean up the database after each test
    await Message.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  // Test: Send a message
  it('should send a message', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        receiver: receiverId,
        content: 'Hello, this is a test message.',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toHaveProperty('content', 'Hello, this is a test message.');
  });

  // Test: Fail to send a message with missing required fields
  it('should not send a message with missing required fields', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        // Missing receiver and content
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Receiver and content are required.');
  });

  // Test: Fail to send a message to a non-existent user
  it('should not send a message to a non-existent user', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        receiver: 'invalidReceiverId', // Invalid receiver ID
        content: 'Hello, this is a test message.',
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Receiver not found.');
  });

  // Test: Fetch messages for a user
  it('should fetch messages for a user', async () => {
    // Create a test message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content: 'Hello, this is a test message.',
    });
    await message.save();

    const res = await request(app)
      .get('/api/messages')
      .set('Authorization', `Bearer ${senderToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('content', 'Hello, this is a test message.');
  });

  // Test: Delete a message
  it('should delete a message', async () => {
    // Create a test message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content: 'Hello, this is a test message.',
    });
    await message.save();

    const res = await request(app)
      .delete(`/api/messages/${message._id}`)
      .set('Authorization', `Bearer ${senderToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Message deleted successfully.');
  });

  // Test: Fail to delete a message that does not exist
  it('should not delete a message that does not exist', async () => {
    const res = await request(app)
      .delete('/api/messages/invalidMessageId')
      .set('Authorization', `Bearer ${senderToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Message not found.');
  });
});