import Profile from '../models/Profile.js';
//import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authMiddleware, agentRoleMiddleware } from '../middlewares/authMiddleware.js';

// Helper function to safely parse JSON strings
const parseJSON = (data) => {
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    return data;  // Return as is if parsing fails
  }
};

// Create Profile
export const createProfile = async (req, res) => {
  try {
    // Check if the user is a "seeker"
    if (req.user.role !== 'seeker') {
      return res.status(403).json({ message: 'Only seekers are allowed to create a profile.' });
    }

    // Parse incoming fields (experience, education, skills, socialLinks, etc.)
    const { fullName, phone, experience, education, bio, skills, socialLinks, address } = req.body;

    // Parse files uploaded (profileImage, resume)
    let profileImage = req.files?.profileImage ? req.files.profileImage[0].path.replace(/\\/g, '/') : null;
    let resume = req.files?.resume ? req.files.resume[0].path.replace(/\\/g, '/') : null;

    // Parse stringified arrays/objects to actual arrays and objects
    const parsedExperience = parseJSON(experience) || [];
    const parsedEducation = parseJSON(education) || [];
    const parsedSkills = parseJSON(skills) || [];
    const parsedSocialLinks = parseJSON(socialLinks) || {};

    // Prepare the profile data object
    const profileData = {
      fullName,
      phone,
      profileImage,
      resume,
      experience: parsedExperience,
      education: parsedEducation,
      bio,
      skills: parsedSkills,
      socialLinks: parsedSocialLinks,
      address,
    };

    // Check if the user already has a profile
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      return res.status(400).json({ message: 'Profile already exists. You cannot create a new one.' });
    }

    // If no profile exists, create a new profile
    profile = new Profile(profileData);
    profile.user = req.user.id;  // Associate profile with authenticated user
    await profile.save();
    
    // Ensure images and files are served correctly
    if (profile.profileImage) {
      profile.profileImage = `${process.env.SERVER_URL}/uploads/${profile.profileImage}`;
    }
    if (profile.resume) {
      profile.resume = `${process.env.SERVER_URL}/uploads/${profile.resume}`;
    }

    return res.status(201).json({ message: 'Profile created successfully', profile });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Profile (Read)
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Ensure images are served properly, assuming images are in the 'uploads' folder
    if (profile.profileImage) {
      profile.profileImage = `${process.env.SERVER_URL}/uploads/${profile.profileImage}`;
    }
    if (profile.resume) {
      profile.resume = `${process.env.SERVER_URL}/uploads/${profile.resume}`;
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    // Find the existing profile for the authenticated user
    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Parse incoming fields (experience, education, skills, socialLinks, etc.)
    const { fullName, phone, experience, education, bio, skills, socialLinks, address } = req.body;

    // Parse files uploaded (profileImage, resume)
    let profileImage = req.files?.profileImage ? req.files.profileImage[0].path.replace(/\\/g, '/') : null;
    let resume = req.files?.resume ? req.files.resume[0].path.replace(/\\/g, '/') : null;

    // Parse stringified arrays/objects to actual arrays and objects
    const parsedExperience = parseJSON(experience) || [];
    const parsedEducation = parseJSON(education) || [];
    const parsedSkills = parseJSON(skills) || [];
    const parsedSocialLinks = parseJSON(socialLinks) || {};

    // Update the profile data with new information, merging with existing data
    profile.set({
      fullName: fullName || profile.fullName,
      phone: phone || profile.phone,
      profileImage: profileImage || profile.profileImage,
      resume: resume || profile.resume,
      experience: parsedExperience.length > 0 ? parsedExperience : profile.experience,
      education: parsedEducation.length > 0 ? parsedEducation : profile.education,
      bio: bio || profile.bio,
      skills: parsedSkills.length > 0 ? parsedSkills : profile.skills,
      socialLinks: Object.keys(parsedSocialLinks).length > 0 ? parsedSocialLinks : profile.socialLinks,
      address: address || profile.address,
    });

    // Save the updated profile
    await profile.save();

    // Ensure images and files are served correctly
    if (profile.profileImage) {
      profile.profileImage = `${process.env.SERVER_URL}/uploads/${profile.profileImage}`;
    }
    if (profile.resume) {
      profile.resume = `${process.env.SERVER_URL}/uploads/${profile.resume}`;
    }

    return res.status(200).json({ message: 'Profile updated successfully', profile });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Profile
export const deleteProfile = async (req, res) => {
  try {
    // Find and delete the profile for the authenticated user
    const profile = await Profile.findOneAndDelete({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update Profile Skills
export const updateProfileSkills = async (req, res) => {
  try {
    // Find the profile for the authenticated user
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Parse the incoming skills
    const { skills } = req.body;
    const parsedSkills = parseJSON(skills) || [];

    // Update the skills array
    profile.skills = parsedSkills.length > 0 ? parsedSkills : profile.skills;

    // Save the updated profile
    await profile.save();

    return res.status(200).json({ message: 'Profile skills updated successfully', profile });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
