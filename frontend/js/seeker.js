document.getElementById('searchBtn').addEventListener('click', function() {
    // Token expiration validation
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('token_expiry');  // Get token expiry time from localStorage

    // Check if token exists and has expired (7 days validity)
    if (!token || !tokenExpiry || Date.now() > tokenExpiry) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('token_expiry');  // Remove expired token
        window.location.href = '/login';  // Redirect to login page
        return;
    }

    const locationType = document.getElementById('locationType').value;
    const location = document.getElementById('location').value;
    const contractType = document.getElementById('contract').value;
    const salary = document.getElementById('salary').value;
    const searchQuery = document.getElementById('jobSearch').value.trim(); 

    const queryParams = new URLSearchParams();

    if (searchQuery) {
        queryParams.append('title', searchQuery.toLowerCase());
    }

    if (locationType === 'local' && location) {
        queryParams.append('location', location);
    }

    if (contractType) {
        queryParams.append('type', contractType);
    }

    if (salary) {
        queryParams.append('salary', salary);
    }

    const remote = locationType === 'remote' ? 'true' : 'false';
    queryParams.append('remote', remote);

    if (queryParams.toString() === '') {
        alert('Please provide at least one filter for the search.');
        return;
    }

    fetch(`/api/jobs/search?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
    })
    .then(response => response.json())
    .then(data => {
        const jobListContainer = document.getElementById('jobList');
        jobListContainer.innerHTML = '';

        if (data.message) {
            const noJobsMessage = document.createElement('p');
            noJobsMessage.textContent = data.message;
            jobListContainer.appendChild(noJobsMessage);
            return;
        }

        // Save search query parameters to localStorage
        localStorage.setItem('searchParams', JSON.stringify({
            searchQuery,
            locationType,
            location,
            contractType,
            salary,
            remote
        }));

        const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs')) || [];

        data.forEach(job => {
            const jobItem = document.createElement('div');
            jobItem.classList.add('job-item');

            const hasApplied = appliedJobs.includes(job._id);  // Check if job is already applied

            // Format the posting date
            const postedDate = new Date(job.createdAt);
            const formattedDate = postedDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });

            jobItem.innerHTML = `
            <div class="job-header">
            <!-- Display the company logo if it exists -->
            ${job.companyLogo ? `<img src="data:image/png;base64,${job.companyLogo}" alt="${job.title} Logo" class="company-logo" />` : ''}
            <h3>${job.title}</h3>
        </div>
                <p>${job.description}</p>
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Salary:</strong> $${new Intl.NumberFormat().format(job.salary)}</p>
                <p><strong>Type:</strong> ${job.type}</p>
                <p><strong>Remote:</strong> ${job.remote ? 'Yes' : 'No'}</p>
                <p><strong>Posted on:</strong> ${formattedDate}</p> <!-- Show the formatted date -->

                <!-- Icon for details -->
                <button class="view-details-btn" data-job-id="${job._id}">
                    <i class="fas fa-info-circle"></i> Details
                </button>

                <button class="apply-btn" data-job-id="${job._id}" ${hasApplied ? 'disabled' : ''}>${hasApplied ? 'Applied' : 'Apply'}</button>
            `;

            jobListContainer.appendChild(jobItem);
        });

        // Add event delegation for both "view-details-btn" and "apply-btn"
        jobListContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('view-details-btn')) {
                const jobId = e.target.getAttribute('data-job-id');
                viewJob(jobId);  // Call viewJob() when Details button is clicked
            }
            if (e.target.classList.contains('apply-btn') && !e.target.disabled) {
                const jobId = e.target.getAttribute('data-job-id');
                openApplyModal(jobId); // Open modal for applying to job
            }
        });
    })
    .catch(error => {
        console.error('Error fetching filtered jobs:', error);
    });
});

// Show/hide the location filter based on location type
document.getElementById('locationType').addEventListener('change', function() {
    const locationType = this.value;
    const locationFilter = document.getElementById('locationFilter');
    locationFilter.style.display = locationType === 'local' ? 'block' : 'none';
});

// Update salary display when slider changes
document.getElementById('salary').addEventListener('input', function() {
    const salaryValue = document.getElementById('salaryValue');
    salaryValue.textContent = new Intl.NumberFormat().format(this.value);
});

// Function to handle viewing a job's details
function viewJob(jobId) {
    // Save the jobId in the localStorage and redirect to the job details page
    localStorage.setItem('viewedJobId', jobId);
    window.location.href = `view.html?jobId=${jobId}`;
}

// Function to handle applying for a job
function applyForJob(jobId) {
    fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
        } else {
            alert('Successfully applied for the job!');
            updateAppliedJobs(jobId);  // Update the applied jobs after successful application
        }
    })
    .catch(error => {
        console.error('Error applying for the job:', error);
        alert('Something went wrong while applying for the job.');
    });
}

// Update the applied jobs list in localStorage
function updateAppliedJobs(jobId) {
    let appliedJobs = JSON.parse(localStorage.getItem('appliedJobs')) || [];
    if (!appliedJobs.includes(jobId)) {
        appliedJobs.push(jobId);
        localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
    }

    // Update the UI to disable the "Apply" button
    const applyButton = document.querySelector(`.apply-btn[data-job-id="${jobId}"]`);
    if (applyButton) {
        applyButton.textContent = 'Applied';
        applyButton.disabled = true;
    }
}

// Function to open the Apply modal (this is triggered by clicking "Apply" button)
function openApplyModal(jobId) {
    const applyModal = document.getElementById('applyModal');
    const applyWithResumeBtn = document.getElementById('applyWithResume');
    const resumeFileInput = document.getElementById('resumeFile');
    const errorMessage = document.getElementById('error-message');

    applyModal.style.display = 'flex';

    applyWithResumeBtn.onclick = function () {
        const formData = new FormData();
        const resumeFile = resumeFileInput.files[0];

        if (!resumeFile) {
            errorMessage.style.display = 'block';
            return;
        }

        errorMessage.style.display = 'none';
        formData.append('resume', resumeFile);

        fetch(`/api/jobs/${jobId}/apply`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || 'Successfully applied for the job!');
            applyModal.style.display = 'none';
            updateAppliedJobs(jobId);  // Update the applied jobs after successful application
        })
        .catch(error => {
            console.error('Error applying for the job:', error);
            alert('Something went wrong while applying for the job.');
        });
    };

    document.getElementById('closeModal').onclick = function () {
        applyModal.style.display = 'none';
    };
}

window.addEventListener('DOMContentLoaded', function() {
    // Retrieve the profile image URL from localStorage
    const storedProfileImage = localStorage.getItem('profileImage');
  
    const profileImageNavElement = document.getElementById('profileImageNav'); // Reference to the profile image in the navbar
  
    if (storedProfileImage) {
      // If a profile image is stored, use it
      profileImageNavElement.src = storedProfileImage;
    } else {
      // If no image is stored, you can either keep a placeholder or default image
      profileImageNavElement.src = 'frontend/assets/2.png'; // Default image for the nav
    }
});
