document.getElementById("loginForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });
    const data = await response.json();
    const messageDiv = document.getElementById("loginMessage");
    if (response.ok) {
        messageDiv.innerHTML = `<span style="color: green;">Login successful!</span>`;
        // Save token in localStorage
        localStorage.setItem("authToken", data.token);
        window.location.href = "home.html"; // Redirect to home page
    } else messageDiv.innerHTML = `<span style="color: red;">${data.message}</span>`;
});

//# sourceMappingURL=login.a5b23d2a.js.map
