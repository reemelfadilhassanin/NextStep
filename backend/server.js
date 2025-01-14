import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { getJobDetails } from './controllers/jobController.js';
import bodyParser from 'body-parser';
import helmet from 'helmet';  // For security headers
import upload from './middlewares/upload.js';  // Import multer upload config
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import chalk from 'chalk';  // Import chalk for colored logging

// Load the appropriate .env file based on NODE_ENV
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });  // Load .env.test for testing
} else {
  dotenv.config();  // Load .env by default
}

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(helmet());  // Add security headers

// Ensure the 'uploads' directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log(chalk.green('Uploads directory created'));
}

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(chalk.green('MongoDB connected successfully')))
  .catch((err) => console.log(chalk.red('MongoDB connection error:', err)));

// Serve static files (e.g., images, CSS, JS) from the frontend folder
const frontendPath = path.resolve('C:/Users/misre/OneDrive/سطح المكتب/traiing/frontend');
app.use(express.static(frontendPath));

// Routes setup
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);  // Job-related routes
app.use('/api/applications', applicationRoutes);  // Application-related routes

// Route to apply for a job (Authenticated user uploading a resume)
app.post('/api/applications/:jobId/apply', upload.single('resume'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId } = req.body;  // Assume userId comes from the authenticated user

    if (!req.file) {
      return res.status(400).json({ message: 'Resume is required.' });
    }

    // Create the application with the resume and other data
    const newApplication = new Application({
      job: jobId,
      user: userId,
      resume: req.file.path,  // Store the path of the uploaded resume file
      status: 'applied',  // Initial status of the application
    });

    await newApplication.save();

    return res.status(201).json({ message: 'Application submitted successfully', application: newApplication });
  } catch (error) {
    console.error(chalk.red(error));
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route to view job details
app.get('/api/jobs/:jobId', getJobDetails);

// Catch-all route for serving index.html for single-page app routing
app.get('*', (req, res) => {
  const indexPath = path.resolve(frontendPath, 'index.html');
  console.log(chalk.cyan('Serving index.html from:', indexPath));
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.log(chalk.red('Error serving index.html:', err));
      res.status(500).send({ message: 'Internal server error' });
    }
  });
});

// Error handling middleware for catch-all API routes
app.use((err, req, res, next) => {
  const status = err.name && err.name === 'ValidationError' ? 400 : 500;
  res.status(status).send({ message: err.message });
});

// Only listen to the port in non-test environments
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(chalk.green(`Server running on http://localhost:${PORT}`));
  });
}

export default app;  // Export app for testing purposes
