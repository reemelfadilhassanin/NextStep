// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e)=>{
    e.preventDefault(); // Prevent the default form submission
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        // Make login API request
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        const data = await response.json();
        if (response.status === 200) {
            // Save the token to localStorage
            const token = data.token;
            localStorage.setItem('token', token);
            // Decode the token to get the role (seeker or agent)
            const decodedToken = decodeToken(token);
            // If the user is a seeker, load the Create Profile form dynamically
            if (decodedToken.role === 'seeker') window.location.href = 'create-profile.html'; // Redirect seeker to create profile page
            else // If the user is an agent, redirect to dashboard
            window.location.href = 'dashboard.html';
        } else document.getElementById('loginMessage').innerText = data.message || 'Login failed';
    } catch (error) {
        console.error('Error logging in:', error);
        document.getElementById('loginMessage').innerText = 'An error occurred. Please try again.';
    }
});
// Decode JWT token to extract payload
function decodeToken(token) {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload); // Decode base64
    return JSON.parse(decodedPayload); // Parse the JSON string into an object
}

//# sourceMappingURL=login.a5b23d2a.js.map
