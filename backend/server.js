import express from 'express';
import { createJob, getJobsByCompany, updateJob, getApplicationCountForJob, getJobsAppliedByUser, applyForJob, updateJobStatus, getFilteredJobs, getJobs, getJobDetails, recommendJobs, deleteJob, getApplicationsForJob } from '../controllers/jobController.js';
import { agentRoleMiddleware } from '../middlewares/authMiddleware.js';  // Ensure agentRoleMiddleware is imported
import { updateApplicationStatus } from '../controllers/applicationController.js';  // Import from applicationController
import applicationRoute from '../routes/applicationRoutes.js';  // Import the application routes
import upload from '../middlewares/uploadM.js';  // Import the upload middleware
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = express.Router();
// Route to get filtered jobs based on query parameters (for job seekers)
router.get('/search', authMiddleware, getFilteredJobs);  // Search for jobs (authenticated job seeker)

// Job routes
router.use('/:jobId/applications', applicationRoute);  // Use the applicationRoute for job applications

// Route to create a job (Authenticated agent only)
router.post('/', authMiddleware, agentRoleMiddleware, createJob); // Apply agentRoleMiddleware here

// Route to get all jobs posted by the authenticated company (Agent)
router.get('/', authMiddleware, getJobsByCompany);

// Get job details by jobId
router.get('/api/jobs/:jobId', getJobDetails);

// Route to get all jobs with optional filters (Accessible by any authenticated user)
router.get('/', authMiddleware, getJobs);

// Route to get filtered jobs based on query parameters (for job seekers)
router.get('/search', authMiddleware, getFilteredJobs);  // Search for jobs (authenticated job seeker)

// Route to update a job (Authenticated agent only)
router.put('/:id', authMiddleware, agentRoleMiddleware, updateJob); // Apply agentRoleMiddleware here

// Route to update job status (Authenticated agent only)
router.put('/:id/status', authMiddleware, agentRoleMiddleware, updateJobStatus); // Apply agentRoleMiddleware here

// In jobRoute.js
router.get('/:id/applications/count', authMiddleware, getApplicationCountForJob);

// Route to get all jobs applied by the user
router.get('/user/applications', authMiddleware, getJobsAppliedByUser);

// Route to apply for a job (Authenticated user)
router.post('/:jobId/apply', authMiddleware, upload.single('resume'), applyForJob);
// Route to update job status (Authenticated agent only)
router.put('/:id/status', authMiddleware, agentRoleMiddleware, updateJobStatus);

// Route to get job details (accessible by all)
router.get('/jobs/:jobId', getJobDetails);

// Route to get job recommendations
router.get('/recommend', authMiddleware, recommendJobs);

// Route to delete a job (Authenticated agent only)
router.delete('/:id', authMiddleware, agentRoleMiddleware, deleteJob);  // Apply agentRoleMiddleware here
// In jobRoute.js
router.get('/:jobId/applications', authMiddleware, agentRoleMiddleware, getApplicationsForJob);

export default router;
