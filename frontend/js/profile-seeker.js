// seekerprofile.js

document.addEventListener("DOMContentLoaded", () => {
    // Fetch the JWT token and role from localStorage
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");
  
    // Debugging: Log the values of token and role
    console.log("Token from localStorage:", token);
    console.log("Role from localStorage:", role);
  
    // Redirect to login page if no token or the role is incorrect
    if (!token || role !== 'seeker') {
      console.log("Redirecting to login because token or role is incorrect");
      window.location.href = "./login.html";  // Redirect to login if no token or wrong role
      return;
    }
  
    // Profile API URL for Seeker
    const profileApiUrl = "http://localhost:5000/api/profile/seeker";
  
    // Fetch user profile information for Seeker
    const fetchSeekerProfile = async () => {
      const response = await fetch(profileApiUrl, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      const profileDiv = document.getElementById("profileInfo");
  
      if (response.ok) {
        profileDiv.innerHTML = `
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
        `;
      } else {
        profileDiv.innerHTML = `<span style="color: red;">${data.message}</span>`;
      }
    };
  
    // Call the function to load the profile
    fetchSeekerProfile();
  
    // Logout functionality
    document.getElementById("logoutButton").addEventListener("click", () => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("role");
      window.location.href = "./login.html";  // Redirect to login page after logout
    });
  });
  