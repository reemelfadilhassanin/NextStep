document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('token_expiry');  // Get token expiry time from localStorage
    const jobId = new URLSearchParams(window.location.search).get('id');
    let quill;

    // Token expiration validation
    if (!token || !tokenExpiry || Date.now() > tokenExpiry) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('token_expiry');  // Remove expired token
        window.location.href = '/login';  // Redirect to login
        return;
    }

    fetch(`/api/jobs/${jobId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
            return;
        }

        // Populate the form with job details
        document.getElementById('jobTitle').value = data.title;
        document.getElementById('jobLocation').value = data.location;
        document.getElementById('jobSalary').value = data.salary;
        document.getElementById('jobType').value = data.type;
        document.getElementById('jobRemote').checked = data.remote;
        document.getElementById('skills').value = data.skillsRequired.join(', ');
        document.getElementById('jobStatus').value = data.status;  // Set the initial job status

        // If the job has a logo, display it
        if (data.companyLogo) {
            const logoPreview = document.getElementById('logoPreview');
            logoPreview.src = 'data:image/png;base64,' + data.companyLogo;
            logoPreview.style.display = 'block';
        }

        // Initialize Quill editor with the job description
        quill = new Quill('#jobDescriptionEditor', {
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

        // Set the fetched job description in the Quill editor
        quill.root.innerHTML = data.description;

        // Show the job form container
        document.getElementById('jobFormContainer').style.display = 'block';
    })
    .catch(error => {
        console.error('Error fetching job details:', error);
        alert('Error fetching job details. Please try again later.');
    });

    // Handle file preview for logo
    document.getElementById('companyLogo').addEventListener('change', function (e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            const logoPreview = document.getElementById('logoPreview');
            logoPreview.src = event.target.result;
            logoPreview.style.display = 'block';
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    });

    // Form submission to update job details
    document.getElementById('updateJobForm').addEventListener('submit', function (event) {
        event.preventDefault();

        if (!quill) {
            alert('Quill editor is not initialized properly.');
            return;
        }

        const updatedJob = {
            title: document.getElementById('jobTitle').value,
            description: quill.root.innerHTML,  // Get description from Quill
            location: document.getElementById('jobLocation').value,
            salary: document.getElementById('jobSalary').value,
            type: document.getElementById('jobType').value,
            remote: document.getElementById('jobRemote').checked,
            skills: document.getElementById('skills').value.split(',').map(skill => skill.trim()), 
            status: document.getElementById('jobStatus').value,  // Include status in the update
        };

        const logoFile = document.getElementById('companyLogo').files[0];
        if (logoFile) {
            const reader = new FileReader();
            reader.onload = function (e) {
                updatedJob.companyLogo = e.target.result.split(',')[1];  // Base64 encoded image
                sendJobUpdate(updatedJob);
            };
            reader.readAsDataURL(logoFile);
        } else {
            sendJobUpdate(updatedJob);
        }
    });

    function sendJobUpdate(updatedJob) {
        fetch(`/api/jobs/${jobId}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedJob),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                return;
            }
            alert('Job updated successfully!');
            // Optionally redirect
            // window.location.href = '/agentjobs.html';
        })
        .catch(error => {
            console.error('Error updating job:', error);
            alert('Error updating job. Please try again later.');
        });
    }
});
