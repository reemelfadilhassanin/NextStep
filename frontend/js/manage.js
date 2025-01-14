document.addEventListener('DOMContentLoaded', function () {
    // Get token and expiry time from localStorage
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('token_expiry');

    // Token expiration validation (7 days)
    if (!token || !tokenExpiry || Date.now() > tokenExpiry) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('token_expiry');
        window.location.href = '/login'; // Redirect to login page
        return;
    }

    // Get the user's skills (this could be from localStorage, a form, or any other source)
    let userSkills = localStorage.getItem('skills') || ''; // Default skills if not set

    // Function to update skills in localStorage and refresh job recommendations
    function updateSkills(newSkills) {
        localStorage.setItem('skills', newSkills);
        userSkills = newSkills;
        fetchJobs(); // Re-fetch the jobs after updating skills
    }

    // Build the query string based on the user's skills
    function buildQueryString() {
        return userSkills ? `?skills=${encodeURIComponent(userSkills)}` : '';
    }

    // Function to fetch job recommendations based on user's skills
    function fetchJobs() {
        const queryString = buildQueryString();

        // Show a loading indicator while fetching
        const jobListContainer = document.getElementById('recommendedJobList');
        jobListContainer.innerHTML = '<p>Loading jobs...</p>';  // Loading text or spinner

        fetch(`/api/jobs/recommend${queryString}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
            }
        })
            .then(response => response.json())
            .then(data => {
                jobListContainer.innerHTML = '';  // Clear previous job listings

                if (data.message) {
                    const noJobsMessage = document.createElement('p');
                    noJobsMessage.textContent = data.message;
                    jobListContainer.appendChild(noJobsMessage);
                    return;
                }

                // Get the applied jobs from localStorage
                const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs')) || [];

                // Filter out the jobs that the user has already applied for
                const filteredJobs = data.filter(job => !appliedJobs.includes(job._id));

                // Dynamically populate the job listings
                filteredJobs.forEach(job => {
                    const jobItem = document.createElement('div');
                    jobItem.classList.add('job-item');

                    jobItem.innerHTML = `  
                        <h3>${job.title}</h3>
                        <p>${job.description}</p>
                        <p><strong>Location:</strong> ${job.location}</p>
                        <p><strong>Salary:</strong> $${new Intl.NumberFormat().format(job.salary)}</p>
                        <p><strong>Type:</strong> ${job.type}</p>
                        <p><strong>Remote:</strong> ${job.remote ? 'Yes' : 'No'}</p>
                        <button class="view-btn" data-job-id="${job._id}">View</button>
                        <button class="apply-btn" data-job-id="${job._id}">Apply</button>
                    `;

                    jobListContainer.appendChild(jobItem);
                });

                // Event delegation for View and Apply buttons
                jobListContainer.addEventListener('click', function (e) {
                    if (e.target.classList.contains('view-btn')) {
                        const jobId = e.target.getAttribute('data-job-id');
                        viewJob(jobId);
                    }
                    if (e.target.classList.contains('apply-btn')) {
                        const jobId = e.target.getAttribute('data-job-id');
                        openApplyModal(jobId);  // Open modal for applying to job
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching recommended jobs:', error);
                jobListContainer.innerHTML = '<p>Error loading jobs. Please try again later.</p>';
            });
    }

    // Fetch jobs when the page loads
    fetchJobs();

    // Function to handle viewing a job's details
    function viewJob(jobId) {
        // Redirect to the view page with the jobId
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
                    updateApplyButtonState(jobId);  // Disable button and update text
                }
            })
            .catch(error => {
                console.error('Error applying for job:', error);
                alert('Something went wrong while applying for the job.');
            });
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
                    updateApplyButtonState(jobId);  // Disable button and update text
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

    // Function to update the apply button to "Applied" and disable it
    function updateApplyButtonState(jobId) {
        const applyButton = document.querySelector(`.apply-btn[data-job-id="${jobId}"]`);
        if (applyButton) {
            applyButton.textContent = 'Applied';
            applyButton.disabled = true;
        }

        // Update the applied jobs in localStorage
        let appliedJobs = JSON.parse(localStorage.getItem('appliedJobs')) || [];
        if (!appliedJobs.includes(jobId)) {
            appliedJobs.push(jobId);
            localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
        }
    }

    // Store token with 7-day expiration in localStorage
    function storeToken(token) {
        const expiryTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        localStorage.setItem('token', token);
        localStorage.setItem('token_expiry', expiryTime);
    }
});
