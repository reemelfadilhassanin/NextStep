document.addEventListener("DOMContentLoaded", function () {
  // Call the function to get the current profile data when the page loads
  getProfile();
});

// Handle profile form submission for both create and update
document.getElementById('profile-form').addEventListener('submit', function (event) {
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
  // Collect form data
  formData.append('fullName', document.getElementById('fullName').value);
  formData.append('phone', document.getElementById('phone').value);
  formData.append('bio', document.getElementById('bio').value);
  formData.append('experienceRole', document.getElementById('experienceRole').value);
  formData.append('experienceCompany', document.getElementById('experienceCompany').value);
  formData.append('experienceYears', document.getElementById('experienceYears').value);
  formData.append('educationDegree', document.getElementById('educationDegree').value);
  formData.append('educationUniversity', document.getElementById('educationUniversity').value);
  formData.append('educationYear', document.getElementById('educationYear').value);
  formData.append('skills', document.getElementById('skills').value);  // Ensure this is updated properly
  formData.append('linkedin', document.getElementById('linkedin').value);
  formData.append('github', document.getElementById('github').value);
  formData.append('address', document.getElementById('address').value);

  const profileImage = document.getElementById('profileImage').files[0];
  const resume = document.getElementById('resume').files[0];

  // Validate required fields
  if (!document.getElementById('fullName').value) {
    alert('Full Name is required');
    return;
  }

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
  const tokenExpiry = localStorage.getItem('token_expiry');

  // Token expiration validation
  if (!token || !tokenExpiry || Date.now() > tokenExpiry) {
    alert('Your session has expired. Please log in again.');
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiry');
    window.location.href = '/login';
    return;
  }

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
      document.getElementById('fullName').value = profileData.fullName || '';
      document.getElementById('phone').value = profileData.phone || '';
      document.getElementById('bio').value = profileData.bio || '';
      document.getElementById('experienceRole').value = profileData.experience[0]?.role || '';
      document.getElementById('experienceCompany').value = profileData.experience[0]?.company || '';
      document.getElementById('experienceYears').value = profileData.experience[0]?.years || '';
      document.getElementById('educationDegree').value = profileData.education[0]?.degree || '';
      document.getElementById('educationUniversity').value = profileData.education[0]?.university || '';
      document.getElementById('educationYear').value = profileData.education[0]?.year || '';
      document.getElementById('skills').value = profileData.skills.join(', ') || '';
      document.getElementById('linkedin').value = profileData.socialLinks?.linkedin || '';
      document.getElementById('github').value = profileData.socialLinks?.github || '';
      document.getElementById('address').value = profileData.address || '';

      // Set Profile Image
      const profileImageElement = document.getElementById('profileImageDisplay');
      if (profileData.profileImage) {
        profileImageElement.src = profileData.profileImage;
      } else {
        profileImageElement.src = 'default-profile-image.jpg'; // Placeholder
      }

      // Set Resume Link
      const resumeLinkElement = document.getElementById('resumeLink');
      if (profileData.resume) {
        resumeLinkElement.href = profileData.resume;
        resumeLinkElement.textContent = 'Download Resume';
      } else {
        resumeLinkElement.href = '#';
        resumeLinkElement.textContent = 'No Resume Uploaded';
      }
    })
    .catch(error => {
      console.error('Error:', error);
      loader.style.display = 'none';
      //alert('Error loading profile data');
    });
}
