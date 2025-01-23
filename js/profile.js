document.addEventListener("DOMContentLoaded", function() {
  // Call the function to get the current profile data when the page loads
  getProfile();
});

// Handle profile form submission for both create and update
document.getElementById('profile-form').addEventListener('submit', function(event) {
  event.preventDefault();
  console.log('Form submitted');

  const token = localStorage.getItem('token');
  const tokenExpiry = localStorage.getItem('token_expiry');

  // Token expiration validation
  if (!token || !tokenExpiry || Date.now() > tokenExpiry) {
    alert('Your session has expired. Please log in again.');
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiry');
    window.location.href = '/login';
    return;
  }

  const formData = new FormData();
  
  // Get form values with null check
  const fullName = document.getElementById('fullName');
  const phone = document.getElementById('phone');
  const bio = document.getElementById('bio');
  const skills = document.getElementById('skills');
  const linkedin = document.getElementById('linkedin');
  const github = document.getElementById('github');
  const address = document.getElementById('address');
  
  if (fullName && fullName.value) {
    formData.append('fullName', fullName.value);
  } else {
    alert('Full Name is required');
    return;
  }
  if (phone && phone.value) formData.append('phone', phone.value);
  if (bio && bio.value) formData.append('bio', bio.value);
  if (skills && skills.value) formData.append('skills', skills.value);
  if (linkedin && linkedin.value) formData.append('linkedin', linkedin.value);
  if (github && github.value) formData.append('github', github.value);
  if (address && address.value) formData.append('address', address.value);

  // Collect Experience and Education as arrays of objects
  const experienceArray = [];
  const experienceEntries = document.querySelectorAll('.experience-entry');
  experienceEntries.forEach((entry, index) => {
    const role = document.getElementById(`experienceRole${index + 1}`);
    const company = document.getElementById(`experienceCompany${index + 1}`);
    const years = document.getElementById(`experienceYears${index + 1}`);

    if (role && company && years && role.value && company.value && years.value) {
      experienceArray.push({ role: role.value, company: company.value, years: years.value });
    }
  });

  const educationArray = [];
  const educationEntries = document.querySelectorAll('.education-entry');
  educationEntries.forEach((entry, index) => {
    const degree = document.getElementById(`educationDegree${index + 1}`);
    const university = document.getElementById(`educationUniversity${index + 1}`);
    const year = document.getElementById(`educationYear${index + 1}`);

    if (degree && university && year && degree.value && university.value && year.value) {
      educationArray.push({ degree: degree.value, university: university.value, yearOfGraduation: year.value });
    }
  });

  // Add the experience and education arrays to FormData
  formData.append('experience', JSON.stringify(experienceArray)); // Send as JSON string
  formData.append('education', JSON.stringify(educationArray));  // Send as JSON string

  // File validation
  const profileImage = document.getElementById('profileImage').files[0];
  const resume = document.getElementById('resume').files[0];

  if (profileImage && !profileImage.type.startsWith('image/')) {
    alert('Please select a valid image file for profile picture.');
    return;
  }

  if (resume && resume.type !== 'application/pdf') {
    alert('Please select a valid PDF file for the resume.');
    return;
  }

  // Append files to the FormData
  if (profileImage) {
    formData.append('profileImage', profileImage);
  }
  if (resume) {
    formData.append('resume', resume);
  }

  // Show loading indicator
  const loader = document.getElementById('loadingSpinner');
  loader.style.display = 'block';

  // Check if the profile already exists by trying to fetch it first
  fetch('/api/profile', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  .then(response => response.json())
  .then(profileData => {
    // If a profile exists, update it
    if (profileData._id) {
      updateProfile(formData, loader, token);
    } else {
      // If no profile exists, create a new profile
      createProfile(formData, loader, token);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error fetching profile, please try again later.');
    loader.style.display = 'none';
  });
});

// Create Profile
function createProfile(formData, loader, token) {
  fetch('/api/profile', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  .then(response => response.json())
  .then(data => {
    loader.style.display = 'none';
    alert(data.message);
    window.location.href = '/seekerdashboard.html'; // Redirect after successful creation
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error creating profile, please try again later.');
    loader.style.display = 'none';
  });
}

// Update Profile
function updateProfile(formData, loader, token) {
  fetch('/api/profile', {
    method: 'PUT', // Use PUT for updating existing profiles
    body: formData,
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  .then(response => response.json())
  .then(data => {
    loader.style.display = 'none';
    alert(data.message);
    window.location.href = '/seekerdashboard.html'; // Redirect after successful update
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error updating profile, please try again later.');
    loader.style.display = 'none';
  });
}

// Get Profile (Read)
function getProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }

  const loader = document.getElementById('loadingSpinner');
  loader.style.display = 'block';

  fetch('/api/profile', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token
    }
  })
  .then(response => response.json())
  .then(profileData => {
    loader.style.display = 'none';

    if (profileData.message === 'Profile not found') {
      console.log('Profile does not exist');
      return;
    }

    // Populate the form fields with existing profile data
    const fullName = document.getElementById('fullName');
    const phone = document.getElementById('phone');
    const bio = document.getElementById('bio');
    const address = document.getElementById('address');
    const skills = document.getElementById('skills');
    const linkedin = document.getElementById('linkedin');
    const github = document.getElementById('github');

    if (fullName) fullName.value = profileData.fullName || '';
    if (phone) phone.value = profileData.phone || '';
    if (bio) bio.value = profileData.bio || '';
    if (address) address.value = profileData.address || '';
    if (skills) skills.value = profileData.skills.join(', ') || '';
    if (linkedin) linkedin.value = profileData.socialLinks?.linkedin || '';
    if (github) github.value = profileData.socialLinks?.github || '';

    // Handle Experience: Dynamically populate experience fields
    const experienceList = profileData.experience || [];
    experienceList.forEach((exp, index) => {
      if (index > 0) {
        addExperienceField(index); // Add more experience fields dynamically if needed
      }

      document.getElementById(`experienceRole${index + 1}`).value = exp.role || '';
      document.getElementById(`experienceCompany${index + 1}`).value = exp.company || '';
      document.getElementById(`experienceYears${index + 1}`).value = exp.years || '';
    });

    // Handle Education: Dynamically populate education fields
    const educationList = profileData.education || [];
    educationList.forEach((edu, index) => {
      if (index > 0) {
        addEducationField(index); // Add more education fields dynamically if needed
      }

      document.getElementById(`educationDegree${index + 1}`).value = edu.degree || '';
      document.getElementById(`educationUniversity${index + 1}`).value = edu.university || '';
      document.getElementById(`educationYear${index + 1}`).value = edu.yearOfGraduation || '';
    });
// Set Profile Image
const profileImageElement = document.getElementById('profileImageDisplay');
const profileImageNavElement = document.getElementById('profileImageNav'); // New reference to the profile image in the nav

if (profileData.profileImage) {
  let profileImagePath = profileData.profileImage;

  // Remove the base URL if it exists (this can handle the part 'http://localhost:5000/')
  profileImagePath = profileImagePath.replace(/^http:\/\/localhost:5000\//, ''); // Remove the base URL

  // Remove duplicate "uploads/" part if present
  profileImagePath = profileImagePath.replace(/^uploads\//, ''); // Remove the first occurrence of "uploads/"

  // Construct the final URL
  const profileImageUrl = `http://localhost:5000/${profileImagePath}`;

  // Log the URL to the console for debugging
  console.log('Profile Image URL:', profileImageUrl);

  // Store the profile image URL in localStorage
  localStorage.setItem('profileImage', profileImageUrl);

  // Set the profile image element's source
  profileImageElement.src = profileImageUrl;

  // Also update the profile image in the navigation bar
  profileImageNavElement.src = profileImageUrl; // Set the source for the nav profile image
} else {
  // If no profile image exists, set to the placeholder image
  profileImageElement.src = 'frontend/assets/2.png'; // Placeholder if no image is uploaded

  // Set the nav image to the placeholder as well
  profileImageNavElement.src = 'frontend/assets/2.png'; // Default image for the nav
}



    // Set Resume Link
    const resumeLinkElement = document.getElementById('resumeLink');
    if (profileData.resume) {
      // Correct the resume URL to avoid '/uploads/uploads/'
      let resumeUrl = profileData.resume;
      // Remove the base URL if it's present
      resumeUrl = resumeUrl.replace(/^http:\/\/localhost:5000\//, '');
      
      if (resumeUrl.startsWith('')) {
          resumeUrl = `http://localhost:5000/${resumeUrl.replace(/uploads\//, '')}`;
      }
      resumeLinkElement.href = resumeUrl;
      resumeLinkElement.textContent = 'Download Resume';
    } else {
      resumeLinkElement.href = '#';
      resumeLinkElement.textContent = 'No Resume Uploaded';
    }
  })
  .catch(error => {
    console.error('Error:', error);
    loader.style.display = 'none';
  });
}

// Function to dynamically add experience fields
function addExperienceField(index) {
  const experienceDiv = document.getElementById('experienceFields');
  const newFieldset = document.createElement('div');
  newFieldset.classList.add('experience-entry');
  newFieldset.innerHTML = `
    <label for="experienceRole${index + 1}" class="form-label">Experience Role</label>
    <input type="text" class="form-control" id="experienceRole${index + 1}" placeholder="Developer">
    
    <label for="experienceCompany${index + 1}" class="form-label">Experience Company</label>
    <input type="text" class="form-control" id="experienceCompany${index + 1}" placeholder="ABC Corp">
    
    <label for="experienceYears${index + 1}" class="form-label">Experience Years</label>
    <input type="number" class="form-control" id="experienceYears${index + 1}" placeholder="3">
  `;
  experienceDiv.appendChild(newFieldset);
}

// Function to dynamically add education fields
function addEducationField(index) {
  const educationDiv = document.getElementById('educationFields');
  const newFieldset = document.createElement('div');
  newFieldset.classList.add('education-entry');
  newFieldset.innerHTML = `
    <label for="educationDegree${index + 1}" class="form-label">Education Degree</label>
    <input type="text" class="form-control" id="educationDegree${index + 1}" placeholder="BSc">
    
    <label for="educationUniversity${index + 1}" class="form-label">Education University</label>
    <input type="text" class="form-control" id="educationUniversity${index + 1}" placeholder="XYZ University">
    
    <label for="educationYear${index + 1}" class="form-label">Education Year</label>
    <input type="number" class="form-control" id="educationYear${index + 1}" placeholder="2020">
  `;
  educationDiv.appendChild(newFieldset);
}

// Add event listeners for adding more fields
document.getElementById('addExperienceBtn').addEventListener('click', function() {
  const currentExperienceCount = document.querySelectorAll('.experience-entry').length;
  addExperienceField(currentExperienceCount);
});

document.getElementById('addEducationBtn').addEventListener('click', function() {
  const currentEducationCount = document.querySelectorAll('.education-entry').length;
  addEducationField(currentEducationCount);
});
