// Retrieve the token from localStorage
const token = localStorage.getItem('token');

if (!token) {
  // If no token exists, redirect to login page
  window.location.href = 'login.html';
} else {
  // Decode the token to ensure the user is a 'seeker'
  const decodedToken = decodeToken(token);
  if (decodedToken.role !== 'seeker') {
    // If the user is not a seeker, redirect them to the dashboard
    window.location.href = 'dashboard.html';
  }
}

// Decode JWT token to extract payload
function decodeToken(token) {
  const payload = token.split('.')[1];
  const decodedPayload = atob(payload); // Decode base64
  return JSON.parse(decodedPayload); // Parse the JSON string into an object
}

// Profile form submission handler
document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent default form submission

  const fullName = document.getElementById('fullName').value;
  const phone = document.getElementById('phone').value;
  const skills = document.getElementById('skills').value.split(',');
  const experience = document.getElementById('experience').value;
  const education = document.getElementById('education').value;
  const resumeLink = document.getElementById('resumeLink').value;

  try {
    // Make API request to save the profile in the database
    const response = await fetch('http://localhost:5000/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullName,
        phone,
        skills,
        experience,
        education,
        resumeLink
      }),
    });

    const data = await response.json();

    if (response.status === 200) {
      alert('Profile saved successfully!');
      // Redirect to another page (e.g., dashboard, search)
      window.location.href = 'search.html';
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('An error occurred. Please try again.');
  }
});
