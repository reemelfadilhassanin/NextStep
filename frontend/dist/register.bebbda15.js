document.getElementById("registerForm").addEventListener("submit", async (e)=>{
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password,
            role
        })
    });
    const data = await response.json();
    const messageDiv = document.getElementById("registerMessage");
    if (response.ok) messageDiv.innerHTML = `<span style="color: green;">Registration successful! You can now <a href="login.html">login</a>.</span>`;
    else messageDiv.innerHTML = `<span style="color: red;">${data.message}</span>`;
});

//# sourceMappingURL=register.bebbda15.js.map
