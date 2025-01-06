document.getElementById("resetPasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const token = window.location.pathname.split('/')[2];  // Get the token from URL
    const newPassword = document.getElementById("newPassword").value;
  
    // Send request to backend to reset the password
    const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newPassword }),
    });
  
    const data = await response.json();
  
    const messageDiv = document.getElementById("message");
    if (response.ok) {
      messageDiv.innerHTML = `<span style="color: green;">${data.message}</span>`;
    } else {
      messageDiv.innerHTML = `<span style="color: red;">${data.message}</span>`;
    }
  });
  