import mongoose from 'mongoose';
import chalk from 'chalk';  // For colored logging
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(chalk.green('MongoDB connected successfully'));
  } catch (err) {
    console.log(chalk.red('MongoDB connection error:', err));
    process.exit(1);  // Exit the process with failure
  }
};

export default connectDB;