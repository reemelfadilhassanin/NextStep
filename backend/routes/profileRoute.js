import express from 'express';
import { createOrUpdateProfile, getProfile } from '../controllers/profileController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js';  // Multer upload middleware

const router = express.Router();

// Route to create or update user profile (Authenticated)
router.post('/', authMiddleware, upload.fields([{ name: 'profileImage' }, { name: 'resume' }]), createOrUpdateProfile);

// Route to get user profile (Authenticated)
router.get('/', authMiddleware, getProfile);

export default router;
