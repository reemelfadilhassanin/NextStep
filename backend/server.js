import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import { router as authRoutes } from './routes/auth.js';
import profileRoutes from './routes/profile.js';  // Profile routes
import fs from 'fs';  // For checking or creating the uploads directory
import jobRoutes from './routes/jobRoutes.js';  // Job routes
import { updateApplicationStatus } from './controllers/applicationController.js'; // Adjust path as needed


dotenv.config();
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('Uploads directory created');
}

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);  // Auth routes
app.use('/api/profile', profileRoutes);  // Profile routes
app.use('/api/jobs', jobRoutes);  // Job routes
app.put('/api/applications/:applicationId/status', updateApplicationStatus);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});