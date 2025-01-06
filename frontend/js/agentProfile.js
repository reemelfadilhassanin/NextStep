document.getElementById("agentProfileForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("You must be logged in to create a profile.");
        return;
    }

    const companyName = document.getElementById("companyName").value;
    const email = document.getElementById("email").value;
    const jobPosting = document.getElementById("jobPosting").value;

    const response = await fetch("http://localhost:5000/api/profile/agent", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
            companyName,
            email,
            jobPosting
        }),
    });

    const data = await response.json();
    if (response.ok) {
        alert("Profile created successfully!");
        window.location.href = "agentProfile.html";  // Redirect to Agent Profile Page
    } else {
        alert(`Error: ${data.message}`);
    }
});
