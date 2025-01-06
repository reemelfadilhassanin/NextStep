document.getElementById("seekerProfileForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("You must be logged in to create a profile.");
        return;
    }

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const skills = document.getElementById("skills").value.split(',').map(skill => skill.trim());
    const location = document.getElementById("location").value;

    const response = await fetch("http://localhost:5000/api/profile/seeker", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
            name,
            email,
            skills,
            location
        }),
    });

    const data = await response.json();
    if (response.ok) {
        alert("Profile created successfully!");
        window.location.href = "seekerProfile.html";  // Redirect to Seeker Profile Page
    } else {
        alert(`Error: ${data.message}`);
    }
});
