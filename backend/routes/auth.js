import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js'; // Import the controller functions

const router = express.Router();

// Register route
router.post('/register', registerUser);  // Map POST /register to registerUser

// Login route
router.post('/login', loginUser);  // Map POST /login to loginUser

// Remove the Forgot Password Route (it's no longer needed)
 // router.post('/forgot-password', forgotPassword);  // Remove this line

export default router;