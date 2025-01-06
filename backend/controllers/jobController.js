// controllers/jobController.js
import Job from '../models/Job.js';
import Application from '../models/Application.js';  // Import the Application model

// Create a new job
export const createJob = async (req, res) => {
  try {
    if (req.user.role !== 'agent') {
      return res.status(403).json({ message: 'Only agents can post jobs.' });
    }

    const { title, description, location, salary } = req.body;

    const newJob = new Job({
      title,
      description,
      location,
      salary,
      postedBy: req.user.id,
    });

    await newJob.save();

    return res.status(201).json({ message: 'Job posted successfully', job: newJob });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all jobs posted by the authenticated company
export const getJobsByCompany = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id });

    if (jobs.length === 0) {
      return res.status(404).json({ message: 'No jobs found for this company.' });
    }

    return res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a job posting
export const updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { title, description, location, salary } = req.body;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this job.' });
    }

    job.title = title;
    job.description = description;
    job.location = location;
    job.salary = salary;
    job.updatedAt = Date.now();

    await job.save();

    return res.status(200).json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get the number of applications for a specific job
export const getApplicationCountForJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Ensure that the job was posted by the authenticated company
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to view applications for this job.' });
    }

    // Get the number of applications for this job
    const applicationCount = await Application.countDocuments({ job: jobId });

    return res.status(200).json({
      message: 'Application count retrieved successfully',
      applicationCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
