// models/Job.js
import mongoose from 'mongoose';

// models/Job.js
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true, index: true },  // Add index for better performance
  salary: { type: Number, required: true },
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'paused'],
    default: 'open',
  },
  type: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract', 'internship'], 
    required: true 
  },
  remote: { type: Boolean, default: false },  // Indicates if the job is remote
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

export default Job;
