import Profile from '../models/Profile.js';

export const createOrUpdateProfile = async (req, res) => {
  try {
    // Check if the user is a "seeker"
    if (req.user.role !== 'seeker') {
      return res.status(403).json({ message: 'Only seekers are allowed to create or update a profile.' });
    }

    // Parse incoming fields (experience, education, skills, socialLinks, etc.)
    const { fullName, phone, experience, education, bio, skills, socialLinks, address } = req.body;

    // Parse files uploaded (profileImage, resume)
    let profileImage = req.files?.profileImage ? req.files.profileImage[0].path : null;
    let resume = req.files?.resume ? req.files.resume[0].path : null;

    // Parse stringified arrays/objects to actual arrays and objects
    const parsedExperience = experience ? JSON.parse(experience) : [];
    const parsedEducation = education ? JSON.parse(education) : [];
    const parsedSkills = skills ? JSON.parse(skills) : [];
    const parsedSocialLinks = socialLinks ? JSON.parse(socialLinks) : {};

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
      // If the profile exists, update the profile
      profile.set(profileData);  // Update existing profile with new data
      await profile.save();
      return res.status(200).json({ message: 'Profile updated successfully', profile });
    } else {
      // If no profile exists, create a new profile
      profile = new Profile(profileData);
      profile.user = req.user.id;  // Associate profile with authenticated user
      await profile.save();
      return res.status(201).json({ message: 'Profile created successfully', profile });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get profile by user
export const getProfile = async (req, res) => {
  try {
    // Find the profile for the authenticated user
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
