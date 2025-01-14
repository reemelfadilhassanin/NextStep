import express from 'express';
import { createProfile, updateProfile, getProfile, deleteProfile } from '../controllers/profileController.js';
import authMiddleware from '../middlewares/authMiddleware.js';  // Correct for named export
import upload from '../middlewares/upload.js';  // Multer upload middleware

const router = express.Router();

// Route to create a new profile (Authenticated)
router.post(
  '/',
  authMiddleware, 
  upload.fields([{ name: 'profileImage' }, { name: 'resume' }]),  // Handle profile image and resume uploads
  createProfile
);

// Route to get the user's profile (Authenticated)
router.get('/', authMiddleware, getProfile);

// Route to update the user's profile (Authenticated)
router.put(
  '/',
  authMiddleware, 
  upload.fields([{ name: 'profileImage' }, { name: 'resume' }]),  // Handle profile image and resume uploads
  updateProfile
);

// Route to delete the user's profile (Authenticated)
router.delete('/', authMiddleware, deleteProfile);

export default router;
