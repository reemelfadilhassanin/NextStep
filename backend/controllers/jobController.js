import Job from '../models/Job.js';
import Application from '../models/Application.js';

// Create a new job
export const createJob = async (req, res) => {
  try {
    if (req.user.role !== 'agent') {
      return res.status(403).json({ message: 'Only agents can post jobs.' });
    }

    const { title, description, location, salary, type, remote } = req.body;

    const newJob = new Job({
      title,
      description,
      location,
      salary,
      type,
      remote,
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
    const { title, description, location, salary, status, type, remote } = req.body;

    if (!title || !description || !location || !salary || !type) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to update this job." });
    }

    job.title = title;
    job.description = description;
    job.location = location;
    job.salary = salary;
    job.status = status;
    job.type = type;
    job.remote = remote;
    job.updatedAt = Date.now();

    await job.save();
    return res.status(200).json({ message: "Job updated successfully.", job });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating job", error: error.message });
  }
};

// Update job status
export const updateJobStatus = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['open', 'closed', 'paused'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this job.' });
    }

    job.status = status;
    job.updatedAt = Date.now();

    await job.save();
    return res.status(200).json({ message: 'Job status updated successfully', job });
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

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to view applications for this job.' });
    }

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
    const userId = req.user.id;

    const applications = await Application.find({ user: userId }).populate('job');

    if (applications.length === 0) {
      return res.status(404).json({ message: 'No applications found for this user.' });
    }

    const appliedJobs = applications.map((application) => ({
      applicationId: application._id,
      job: application.job,
      status: application.status,
      appliedAt: application.appliedAt,
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
    const { jobId } = req.params;
    const userId = req.user.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const existingApplication = await Application.findOne({ job: jobId, user: userId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    const newApplication = new Application({
      job: jobId,
      user: userId,
      status: 'applied',
    });

    await newApplication.save();
    return res.status(201).json({ message: 'Application submitted successfully', application: newApplication });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get filtered jobs based on query params
export const getFilteredJobs = async (req, res) => {
  try {
    let { location, salary, remote, type } = req.query;

    let filter = { status: 'open' };

    if (location) {
      location = location.trim();
      filter.location = { $regex: location, $options: 'i' };
    }

    if (salary) {
      filter.salary = { $gte: salary };
    }

    if (remote !== undefined) {
      filter.remote = remote === 'true';
    }

    if (type) {
      filter.type = type;
    }

    const jobs = await Job.find(filter);

    if (jobs.length === 0) {
      return res.status(404).json({ message: 'No jobs found matching your criteria.' });
    }

    return res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all jobs with optional filters
export const getJobs = async (req, res) => {
  try {
    const { title, location, salary, remote, fullTime } = req.query;

    let filter = {};

    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (salary) {
      filter.salary = { $lte: Number(salary) };
    }

    if (remote) {
      filter.remote = remote === 'true';
    }

    if (fullTime) {
      filter.type = 'full-time';
    }

    const jobs = await Job.find(filter);

    if (jobs.length === 0) {
      return res.status(404).json({ message: 'No jobs found based on your criteria.' });
    }

    return res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
