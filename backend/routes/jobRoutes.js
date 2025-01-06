// routes/jobRoutes.js
import express from 'express';
import { createJob, getJobsByCompany, updateJob, getApplicationCountForJob } from '../controllers/jobController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Correct import

const router = express.Router();

// Route to create a job (Authenticated agent)
router.post('/', authMiddleware, createJob);

// Route to get all jobs posted by the authenticated company
router.get('/', authMiddleware, getJobsByCompany);

// Route to update a job (Authenticated agent)
router.put('/:id', authMiddleware, updateJob);

// Route to get the application count for a specific job
router.get('/:id/applications/count', authMiddleware, getApplicationCountForJob);

export default router;
