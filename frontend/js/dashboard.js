// Check if a token exists and is valid
const token = localStorage.getItem('token');

if (!token) {
  // If no token exists, redirect to login page
  window.location.href = 'login.html';
} else {
  // Decode token to ensure the user is valid and has proper role
  const decodedToken = decodeToken(token);
  if (decodedToken.role !== 'agent') {
    // If the user is not an agent, redirect to the profile creation page or another page
    window.location.href = 'create-profile.html'; // Or wherever you want to send the seeker
  } else {
    // Display agent dashboard content here
    document.getElementById('dashboardContent').style.display = 'block'; // Show dashboard content
  }
}

// Function to decode the JWT token
function decodeToken(token) {
  const payload = token.split('.')[1];
  const decodedPayload = atob(payload); // Decode base64
  return JSON.parse(decodedPayload); // Parse the JSON string into an object
}
