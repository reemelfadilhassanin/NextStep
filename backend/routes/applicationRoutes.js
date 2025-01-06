import express from 'express';
import { updateApplicationStatus } from '../controllers/applicationController.js';
import { authMiddleware, agentRoleMiddleware } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

// Route to update application status (Authenticated agent only)
router.put('/:applicationId/status', authMiddleware, agentRoleMiddleware, updateApplicationStatus);

export default router;
