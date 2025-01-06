import mongoose from 'mongoose';

const seekerProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  skills: { type: [String], required: true },
  location: { type: String, required: true },
});

const SeekerProfile = mongoose.model('SeekerProfile', seekerProfileSchema);

export default SeekerProfile; // Correct export
