import express from 'express';
import { getApplicationDetails, updateApplicationStatus } from '../controllers/applicationController.js';
import Application from '../models/Application.js';
import { authMiddleware, agentRoleMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.delete('/:applicationId', authMiddleware, agentRoleMiddleware, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const job = await Job.findById(application.job);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to delete this application' });
    }

    await application.remove();

    return res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { job, user, profile, resume, experience, education, skills, socialLinks } = req.body;

    if (!job || !user || !profile || !resume) {
      return res.status(400).json({ message: 'Job, User, Profile, and Resume are required' });
    }

    const newApplication = new Application({
      job,
      user,
      profile,
      resume,
      experience,
      education,
      skills,
      socialLinks,
      status: 'applied',
    });

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

router.get('/:applicationId', authMiddleware, agentRoleMiddleware, getApplicationDetails);

router.put('/user/:userId/status', authMiddleware, agentRoleMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const applications = await Application.find({ user: userId });

    if (applications.length === 0) {
      return res.status(404).json({ message: 'No applications found for this user' });
    }

    const updatedApplications = await Application.updateMany(
      { user: userId },
      { $set: { status } }
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

router.put('/user/:userId/status/:jobId', authMiddleware, agentRoleMiddleware, async (req, res) => {
  try {
    const { userId, jobId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const application = await Application.findOne({ user: userId, job: jobId })
      .populate('profile', 'experience education skills')
      .populate('job', 'title description');

    if (!application) {
      return res.status(404).json({ message: 'Application not found for this user and job' });
    }

    application.status = status;
    application.updatedAt = Date.now();

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

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const applications = await Application.find({ job: jobId })
      .populate('user', 'name email')
      .populate('profile', 'bio skills linkedin')
      .populate('job', 'title company location')
      .exec();

    if (applications.length === 0) {
      return res.status(404).json({ message: 'No applicants found for this job.' });
    }

    return res.status(200).json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { job, resume } = req.body;

    if (!job || !resume) {
      return res.status(400).json({ message: 'Job and Resume are required.' });
    }

    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Please create a profile first.' });
    }

    const { experience, education, skills, socialLinks } = profile;

    const newApplication = new Application({
      job,
      user: req.user.id,
      profile: profile._id,
      resume,
      experience,
      education,
      skills,
      socialLinks,
      status: 'applied',
    });

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
