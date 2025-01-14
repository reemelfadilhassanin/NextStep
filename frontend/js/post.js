// Preview the selected logo image
document.getElementById('companyLogo').addEventListener('change', function (event) {
    const logoPreview = document.getElementById('logoPreview');
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            logoPreview.src = e.target.result;
            logoPreview.style.display = 'block'; // Show the preview
        };
        reader.readAsDataURL(file);
    } else {
        logoPreview.style.display = 'none'; // Hide the preview if no logo is selected
    }
});

// Initialize Quill editor
const quill = new Quill('#jobDescriptionEditor', {
    theme: 'snow',
    placeholder: 'Enter job description...',
    modules: {
        toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline'],
            [{ 'align': [] }],
            ['link', 'blockquote', 'image'],
        ],
    },
});

// Handle job posting form submission
document.getElementById('postJobForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    console.log('Job post form submitted'); // Debugging log

    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('token_expiry');

    // Token expiration validation
    if (!token || !tokenExpiry || Date.now() > tokenExpiry) {
        console.log("Token expired or missing"); // Debugging log
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('token_expiry');
        window.location.href = '/login'; // Redirect to login
        return;
    }

    // Prepare the job post data
    const jobData = {
        title: document.getElementById('jobTitle').value,
        description: quill.root.innerHTML, // Get the HTML content from Quill editor
        location: document.getElementById('location').value,
        salary: document.getElementById('salary').value,
        type: document.getElementById('jobType').value,
        remote: document.getElementById('remote').checked,
        skills: document.getElementById('skills').value.split(',').map(skill => skill.trim())
    };

    // Handle company logo image file
    const companyLogo = document.getElementById('companyLogo').files[0];
    const loader = document.getElementById('loadingSpinner');
    loader.style.display = 'block'; // Show loading spinner while submitting

    if (companyLogo) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // Convert the image to base64 string
            jobData.companyLogo = e.target.result.split(',')[1]; // Only get the base64 part

            // Submit the job posting as raw JSON
            submitJobData(jobData);
        };
        reader.readAsDataURL(companyLogo);
    } else {
        // No logo selected, just submit the job without it
        submitJobData(jobData);
    }
});

// Function to submit the job data to the server
function submitJobData(jobData) {
    const token = localStorage.getItem('token');
    
    fetch('/api/jobs', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json', // Set Content-Type to application/json
        },
        body: JSON.stringify(jobData), // Send the data as a JSON string
    })
    .then(response => response.json())
    .then(data => {
        const loader = document.getElementById('loadingSpinner');
        loader.style.display = 'none'; // Hide loading spinner after submission
        if (data.message === 'Job posted successfully') {
            alert(data.message);
            // window.location.href = '/agent-dashboard.html'; // Redirect after successful job post
        } else {
            alert(data.message); // Display error message from the server
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const loader = document.getElementById('loadingSpinner');
        loader.style.display = 'none'; // Hide loading spinner after error
        alert('Error posting job. Please try again later.');
    });
}

// Function to delete a job
function deleteJob(jobId) {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('You are not logged in.');
        return;
    }

    if (confirm('Are you sure you want to delete this job?')) {
        fetch(`/api/jobs/${jobId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Job deleted successfully.') {
                alert(data.message);
                // Optionally, reload the page or remove the job from the UI without reloading
                location.reload();  // Or manually remove the job from the DOM
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting job. Please try again later.');
        });
    }
}

// Example of storing token with an expiry date when the user logs in
function storeToken(token) {
    const expiryTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    localStorage.setItem('token', token);
    localStorage.setItem('token_expiry', expiryTime);
}
