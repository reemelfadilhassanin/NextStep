// routes/jobRoutes.js
import express from 'express';
import { createJob, getJobsByCompany, updateJob, getApplicationCountForJob, getJobsAppliedByUser, applyForJob, updateJobStatus } from '../controllers/jobController.js';
import { authMiddleware, agentRoleMiddleware } from '../middlewares/authMiddleware.js';  // Named imports

const router = express.Router();

// Route to create a job (Authenticated agent only)
router.post('/', authMiddleware, agentRoleMiddleware, createJob);

// Route to get all jobs posted by the authenticated company (Agent)
router.get('/', authMiddleware, getJobsByCompany);

// Route to update a job (Authenticated agent only)
router.put('/:id', authMiddleware, agentRoleMiddleware, updateJob);

// Route to update job status (Authenticated agent only)
router.put('/:id/status', authMiddleware, agentRoleMiddleware, updateJobStatus);

// Route to get the application count for a specific job
router.get('/:id/applications/count', authMiddleware, getApplicationCountForJob);

// Route to get all jobs applied by the user
router.get('/user/applications', authMiddleware, getJobsAppliedByUser);

// Route to apply for a job (Authenticated user)
router.post('/:jobId/apply', authMiddleware, applyForJob);

export default router;
