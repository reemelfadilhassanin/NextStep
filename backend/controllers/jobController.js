// controllers/jobController.js
import Job from '../models/Job.js';

// Create a new job
export const createJob = async (req, res) => {
  try {
    // Ensure the user is an agent (company), not a seeker
    if (req.user.role !== 'agent') {
      return res.status(403).json({ message: 'Only agents can post jobs.' });
    }

    const { title, description, location, salary } = req.body;

    // Create a new job post
    const newJob = new Job({
      title,
      description,
      location,
      salary,
      postedBy: req.user.id, // Associate the job with the authenticated company user
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
    // Fetch all jobs posted by the authenticated company
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

    // Find the job by ID and check if it was posted by the authenticated company
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Check if the authenticated user is the one who posted the job
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this job.' });
    }

    // Update the job with new data
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
