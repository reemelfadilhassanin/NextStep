import Job from '../models/Job.js';
import Application from '../models/Application.js';  // Import the Application model

// Create a new job
export const createJob = async (req, res) => {
  try {
    // Only agents can post jobs
    if (req.user.role !== 'agent') {
      return res.status(403).json({ message: 'Only agents can post jobs.' });
    }

    const { title, description, location, salary } = req.body;

    // Create a new job posting
    const newJob = new Job({
      title,
      description,
      location,
      salary,
      postedBy: req.user.id,  // Link to the company posting the job
    });

    // Save the job to the database
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
    // Retrieve all jobs posted by the logged-in company (user)
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

    // Find the job by ID
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Ensure the job belongs to the authenticated user (company)
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this job.' });
    }

    // Update the job details
    job.title = title;
    job.description = description;
    job.location = location;
    job.salary = salary;
    job.updatedAt = Date.now();

    // Save the updated job
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

    // Find the job by ID
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Ensure that the job was posted by the authenticated user (company)
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to view applications for this job.' });
    }

    // Get the count of applications for this job
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

// Get all jobs the user has applied for
export const getJobsAppliedByUser = async (req, res) => {
  try {
    const userId = req.user.id;  // Get the user ID from the authenticated user

    // Find all applications for the user and populate the job details
    const applications = await Application.find({ user: userId }).populate('job');

    if (applications.length === 0) {
      return res.status(404).json({ message: 'No applications found for this user.' });
    }

    // Map through the applications to get the job details along with the status
    const appliedJobs = applications.map((application) => ({
      job: application.job,  // Full job details (title, description, etc.)
      status: application.status,  // Application status (applied, interviewing, rejected, hired)
      appliedAt: application.appliedAt,  // When they applied
    }));

    return res.status(200).json({
      message: 'Jobs retrieved successfully',
      appliedJobs,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Apply for a job
export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;  // Get the jobId from the URL parameters
    const userId = req.user.id;    // Get the user ID from the authenticated user (from authMiddleware)

    // Ensure the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the user has already applied for the job
    const existingApplication = await Application.findOne({ job: jobId, user: userId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    // Create a new application for the job
    const newApplication = new Application({
      job: jobId,
      user: userId,
      status: 'applied',  // Initial status when the user applies
    });

    // Save the application to the database
    await newApplication.save();

    return res.status(201).json({ message: 'Application submitted successfully', application: newApplication });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
