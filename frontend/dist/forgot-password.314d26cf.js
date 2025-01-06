document.getElementById("forgotPasswordForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const email = document.getElementById("email").value;
    // Send email to backend to request password reset link
    const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email
        })
    });
    const data = await response.json();
    const messageDiv = document.getElementById("message");
    if (response.ok) messageDiv.innerHTML = `<span style="color: green;">${data.message}</span>`;
    else messageDiv.innerHTML = `<span style="color: red;">${data.message}</span>`;
});

//# sourceMappingURL=forgot-password.314d26cf.js.map
