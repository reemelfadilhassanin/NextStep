import express from 'express';
import { getApplicationDetails, updateApplicationStatus } from '../controllers/applicationController.js';
import Application from '../models/Application.js';  // Ensure to import Application model
import { authMiddleware, agentRoleMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
// Route to delete an application by ID
router.delete('/:applicationId', authMiddleware, agentRoleMiddleware, async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Find the application to delete
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Ensure that only the agent who posted the job can delete the application
    const job = await Job.findById(application.job);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the logged-in agent is the one who posted the job
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this application' });
    }

    // Delete the application
    await application.remove();

    return res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Route to create a new application
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { job, user, profile, resume, experience, education, skills, socialLinks } = req.body;

    // Check for required fields
    if (!job || !user || !profile || !resume) {
      return res.status(400).json({ message: 'Job, User, Profile, and Resume are required' });
    }

    // Create new application
    const newApplication = new Application({
      job,
      user,
      profile,
      resume,
      experience,
      education,
      skills,
      socialLinks,
      status: 'applied',  // Default status
    });

    // Save the application
    const application = await newApplication.save();

    return res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});
