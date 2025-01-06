// Get form elements
const registerForm = document.getElementById('registerForm');
const registerMessage = document.getElementById('registerMessage');
// Handle form submission
registerForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    // Prepare the data to send to the server
    const userData = {
        email,
        password,
        role
    };
    try {
        // Send data to the backend API
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        // Check if the registration was successful
        if (response.ok) // Redirect to the login page on success
        window.location.href = 'login.html';
        else {
            // Display the error message
            registerMessage.textContent = data.message;
            registerMessage.style.color = 'red';
        }
    } catch (error) {
        // Handle any errors during the fetch request
        console.error('Error during registration:', error);
        registerMessage.textContent = 'An error occurred. Please try again.';
        registerMessage.style.color = 'red';
    }
});

//# sourceMappingURL=register.bebbda15.js.map
