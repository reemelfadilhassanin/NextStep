import express from 'express';
import { createJob, getJobsByCompany, updateJob, getApplicationCountForJob, getJobsAppliedByUser, applyForJob, updateJobStatus, getFilteredJobs, getJobs, getJobDetails, recommendJobs, deleteJob, getApplicationsForJob } from '../controllers/jobController.js';
import { agentRoleMiddleware } from '../middlewares/authMiddleware.js';  // Ensure agentRoleMiddleware is imported
import { updateApplicationStatus } from '../controllers/applicationController.js';  // Import from applicationController
import applicationRoute from '../routes/applicationRoutes.js';  // Import the application routes
import upload from '../middlewares/upload.js';  // Import the upload middleware
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = express.Router();
// Route to get filtered jobs based on query parameters (for job seekers)
router.get('/search', authMiddleware, getFilteredJobs);  // Search for jobs (authenticated job seeker)
