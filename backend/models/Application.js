// models/Application.js
import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',  // Reference to the Job model
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Reference to the User model
      required: true,
    },
    status: {
      type: String,
      enum: ['applied', 'interviewing', 'hired', 'rejected'],
      default: 'applied',  // Default status when applying
    },
    appliedAt: {
      type: Date,
      default: Date.now,  // Timestamp for when the application was made
    },
  },
  { timestamps: true }
);

const Application = mongoose.model('Application', applicationSchema);
export default Application;
