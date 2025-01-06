import mongoose from 'mongoose';

// Subschemas for experience and education
const experienceSchema = new mongoose.Schema({
  years: { type: Number, required: true },
  role: { type: String, required: true },
  company: { type: String, required: true },
}, { _id: false });

const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  university: { type: String, required: true },
  yearOfGraduation: { type: Number, required: true },
}, { _id: false });

// Main Profile Schema
const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  profileImage: { type: String },  // URL or path to the image
  resume: { type: String }, // Path to resume file
  experience: [experienceSchema],
  education: [educationSchema],
  address: { type: String },
  bio: { type: String },
  skills: { type: [String] },  // Array of skills
  socialLinks: {
    linkedin: { type: String },
    github: { type: String },
    twitter: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
