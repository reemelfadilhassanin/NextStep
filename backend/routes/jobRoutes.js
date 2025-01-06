// routes/jobRoutes.js
import express from 'express';
import { createJob, getJobsByCompany, updateJob } from '../controllers/jobController.js';
import authMiddleware from '../middlewares/authMiddleware.js'; // Correct import

const router = express.Router();

// Route to create a job (Authenticated company)
router.post('/', authMiddleware, createJob);

// Route to get all jobs posted by the authenticated company
router.get('/', authMiddleware, getJobsByCompany);

// Route to update a job (Authenticated company)
router.put('/:id', authMiddleware, updateJob);

export default router;
