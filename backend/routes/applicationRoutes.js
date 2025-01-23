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


/* Route to get applications for a specific job
router.get('/:jobId', authMiddleware, agentRoleMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if jobId is provided
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    // Fetch applications for this job and populate necessary fields
    const applications = await Application.find({ job: jobId })
      .populate('user', 'name email')  // Populate user details (name and email)
      .populate('profile', 'bio skills linkedin')  // Populate profile details (optional fields)
      .populate('job', 'title company location')  // Populate job details (optional fields)
      .exec();

    // If no applications found, return a 404 response
    if (applications.length === 0) {
      return res.status(404).json({ message: 'No applicants found for this job.' });
    }

    // Return applications with populated user, profile, and job details
    return res.status(200).json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});*/

// Route to get application details (one specific application)
router.get('/:applicationId', authMiddleware, agentRoleMiddleware, getApplicationDetails);

router.put('/user/:userId/status', authMiddleware, agentRoleMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;  // Get userId from URL
    const { status } = req.body;    // Get status from body

    // Validate the status
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Find applications for the given user
    const applications = await Application.find({ user: userId });

    if (applications.length === 0) {
      return res.status(404).json({ message: 'No applications found for this user' });
    }

    // Update all applications for this user with the new status
    const updatedApplications = await Application.updateMany(
      { user: userId },          // Filter by userId
      { $set: { status } }       // Only update the status field
    );

    return res.status(200).json({
      message: 'Application statuses updated successfully',
      updatedApplications,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Route to update application status (Authenticated agent only)
//router.put('/:applicationId/status', authMiddleware, agentRoleMiddleware, updateApplicationStatus);
router.put('/user/:userId/status/:jobId', authMiddleware, agentRoleMiddleware, async (req, res) => {
  try {
    const { userId, jobId } = req.params;  // Get userId and jobId from URL
    const { status } = req.body;           // Get status from body

    // Validate the status
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Find the specific application for the given user and job, populate the profile field and its nested fields
    const application = await Application.findOne({ user: userId, job: jobId })
      .populate('profile', 'experience education skills')  // Populate profile fields like experience, education, skills
      .populate('job', 'title description');  // Optional: You can populate job details if needed

    if (!application) {
      return res.status(404).json({ message: 'Application not found for this user and job' });
    }

    // Update the status of the specific application
    application.status = status;
    application.updatedAt = Date.now();  // Update the timestamp of the application

    await application.save();

    return res.status(200).json({
      message: 'Application status updated successfully',
      updatedApplication: application,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:jobId', authMiddleware, agentRoleMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if jobId is provided
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    // Fetch applications for this job and populate necessary fields
    const applications = await Application.find({ job: jobId })
      .populate('user', 'name email')  // Populate user details (name and email)
      .populate('profile', 'bio skills linkedin')  // Populate profile details (optional fields)
      .populate('job', 'title company location')  // Populate job details (optional fields)
      .exec();

    // If no applications found, return a 404 response
    if (applications.length === 0) {
      return res.status(404).json({ message: 'No applicants found for this job.' });
    }

    // Return applications with populated user, profile, and job details
    return res.status(200).json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Route to create a new application using fill from profile user
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { job, resume } = req.body;

    // Ensure job and resume are provided
    if (!job || !resume) {
      return res.status(400).json({ message: 'Job and Resume are required.' });
    }

    // Fetch the user's profile (if it exists)
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Please create a profile first.' });
    }

    // Use the profile data (experience, education, skills, social links, etc.)
    const { experience, education, skills, socialLinks } = profile;

    // Create a new application
    const newApplication = new Application({
      job,
      user: req.user.id,
      profile: profile._id, // Reference to the profile
      resume, // Use the provided resume
      experience, // Include the profile's experience data
      education, // Include the profile's education data
      skills, // Include the profile's skills
      socialLinks, // Include the profile's social links
      status: 'applied', // Default status
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




export default router;
