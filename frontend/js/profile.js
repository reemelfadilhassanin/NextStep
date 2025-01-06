document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const skills = document.getElementById('skills').value.split(',').map(skill => skill.trim());
  const experience = document.getElementById('experience').value;
  const education = document.getElementById('education').value;

  const authToken = sessionStorage.getItem('authToken');

  if (!authToken) {
    alert("You must be logged in to update your profile.");
    return;
  }

  const profileData = { name, email, skills, experience, education };

  try {
    const response = await fetch('http://localhost:5000/api/user/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(profileData)
    });

    const data = await response.json();
    const messageDiv = document.getElementById('profileMessage');
    
    if (response.ok) {
      messageDiv.textContent = 'Profile saved successfully!';
      messageDiv.style.color = 'green';
    } else {
      messageDiv.textContent = data.message;
      messageDiv.style.color = 'red';
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    const messageDiv = document.getElementById('profileMessage');
    messageDiv.textContent = 'An error occurred. Please try again.';
    messageDiv.style.color = 'red';
  }
});
