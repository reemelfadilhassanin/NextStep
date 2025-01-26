import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';

describe('Message Model', () => {
  let sender;
  let receiver;

  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test sender user
    sender = new User({
      email: 'sender@example.com',
      password: 'password123',
      role: 'seeker',
    });
    await sender.save();

    // Create a test receiver user
    receiver = new User({
      email: 'receiver@example.com',
      password: 'password123',
      role: 'agent',
    });
    await receiver.save();
  });

  afterEach(async () => {
    // Clean up the database after each test
    await Message.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  // Test: Create a new message
  it('should create a new message', async () => {
    const message = new Message({
      sender: sender._id,
      receiver: receiver._id,
      content: 'Hello, this is a test message.',
    });

    await message.save();

    const foundMessage = await Message.findOne({ content: 'Hello, this is a test message.' });
    expect(foundMessage).toHaveProperty('sender', sender._id);
    expect(foundMessage).toHaveProperty('receiver', receiver._id);
    expect(foundMessage).toHaveProperty('content', 'Hello, this is a test message.');
  });

  // Test: Fail to create a message with missing required fields
  it('should not create a message with missing required fields', async () => {
    const message = new Message({
      // Missing sender, receiver, and content
    });

    let error;
    try {
      await message.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.sender).toBeDefined();
    expect(error.errors.receiver).toBeDefined();
    expect(error.errors.content).toBeDefined();
  });

  // Test: Fail to create a message with invalid sender or receiver
  it('should not create a message with invalid sender or receiver', async () => {
    const message = new Message({
      sender: 'invalidSenderId', // Invalid sender ID
      receiver: 'invalidReceiverId', // Invalid receiver ID
      content: 'Hello, this is a test message.',
    });

    let error;
    try {
      await message.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.sender).toBeDefined();
    expect(error.errors.receiver).toBeDefined();
  });

  // Test: Update message content
  it('should update message content', async () => {
    const message = new Message({
      sender: sender._id,
      receiver: receiver._id,
      content: 'Hello, this is a test message.',
    });
    await message.save();

    message.content = 'This message has been updated.';
    await message.save();

    const foundMessage = await Message.findOne({ _id: message._id });
    expect(foundMessage).toHaveProperty('content', 'This message has been updated.');
  });

  // Test: Delete a message
  it('should delete a message', async () => {
    const message = new Message({
      sender: sender._id,
      receiver: receiver._id,
      content: 'Hello, this is a test message.',
    });
    await message.save();

    await Message.deleteOne({ _id: message._id });

    const foundMessage = await Message.findOne({ _id: message._id });
    expect(foundMessage).toBeNull();
  });
});