import Application from '../models/Application.js';  // Ensure correct import path
import Job from '../models/Job.js';

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;  // Extract applicationId from URL
    const { status } = req.body;  // Extract new status from request body

    // Validate the status
    const validStatuses = ['approved', 'rejected', 'interviewing'];  // Only these statuses are allowed
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value. Valid values are "approved", "rejected", and "interviewing".' });
    }

    // Ensure the user (agent) is authenticated and has a role
    if (!req.user || req.user.role !== 'agent') {
      return res.status(403).json({ message: 'You do not have permission to update the application status.' });
    }

    // Log to check the Application model and applicationId
    console.log('Application Model:', Application);  // Check if the Application model is correctly imported
    console.log('Application ID:', applicationId);  // Ensure the application ID is received

    // Find the application by its ID
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if the application is in the right state to change status
    if (application.status === 'approved' && status === 'interviewing') {
      return res.status(400).json({ message: 'Cannot change status from approved to interviewing.' });
    }
    if (application.status === 'rejected') {
      return res.status(400).json({ message: 'Cannot update a rejected application.' });
    }

    // Find the job related to this application
    const job = await Job.findById(application.job);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Ensure the job belongs to the authenticated agent (check if agent posted the job)
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to manage this application' });
    }

    // Update the status of the application
    application.status = status;
    application.updatedAt = Date.now();  // Update the timestamp

    // Save the updated application
    await application.save();

    return res.status(200).json({
      message: 'Application status updated successfully',
      application,
    });

  } catch (error) {
    console.error(error);

    // Handle token expiration error
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }

    // Catch any other errors
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
