// RecruitWorX Application JavaScript

// Global State
let currentUser = null;
let currentRoute = '';

// In-memory Data Stores
let users = [
    { id: 1, email: 'admin@rw.com', password: 'admin', role: 'admin', name: 'Admin User' },
    { id: 2, email: 'hr@rw.com', password: 'hr', role: 'hr', name: 'HR Manager' },
    { id: 3, email: 'john@example.com', password: 'candidate', role: 'candidate', name: 'John Doe', phone: '123-456-7890', skills: 'JavaScript, React, Node.js' }
];

let jobs = [
    {
        id: 1,
        title: 'Frontend Developer',
        description: 'We are looking for a skilled Frontend Developer to join our team. You will be responsible for building user interfaces using modern web technologies.',
        location: 'New York, NY',
        type: 'Full-time',
        salary: '$60,000 - $80,000',
        skills: 'JavaScript, React, CSS, HTML',
        deadline: '2025-08-15',
        postedBy: 2,
        postedDate: '2025-07-01',
        status: 'active'
    },
    {
        id: 2,
        title: 'Backend Developer',
        description: 'Join our backend team to develop scalable server-side applications. Experience with Node.js and databases required.',
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: '$70,000 - $90,000',
        skills: 'Node.js, MongoDB, Express, API Development',
        deadline: '2025-08-20',
        postedBy: 2,
        postedDate: '2025-07-05',
        status: 'active'
    }
];

let candidates = [];

let applications = [
    {
        id: 1,
        jobId: 1,
        candidateId: 3,
        appliedDate: '2025-07-10',
        status: 'Applied',
        resume: 'john_doe_resume.pdf',
        coverLetter: 'I am interested in this position...',
        interview: null
    }
];

let nextId = {
    users: 4,
    jobs: 3,
    candidates: 1,
    applications: 2
};

// Utility Functions
function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container');
    
    // Create a unique toast element
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast border-${type}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-${type} text-white">
                <strong class="me-auto">Notification</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">${message}</div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 5000
    });
    
    bsToast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
    
    // Console log for email simulation
    console.log(`📧 Email Notification: ${message}`);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function getStatusBadgeClass(status) {
    const statusMap = {
        'Applied': 'bg-primary',
        'Shortlisted': 'bg-warning',
        'Interviewed': 'bg-info',
        'Selected': 'bg-success',
        'Rejected': 'bg-danger'
    };
    return statusMap[status] || 'bg-secondary';
}

// Authentication Functions
function login(email, password, role) {
    const user = users.find(u => u.email === email && u.password === password && u.role === role);
    if (user) {
        currentUser = user;
        updateNavigation();
        showToast(`Welcome back, ${user.name}!`, 'success');
        navigateTo('#/dashboard');
        return true;
    }
    showToast('Invalid credentials. Please try again.', 'danger');
    return false;
}

function logout() {
    currentUser = null;
    updateNavigation();
    showToast('Logged out successfully', 'info');
    navigateTo('#/');
}

function updateNavigation() {
    const authSection = document.getElementById('navAuthSection');
    const userSection = document.getElementById('navUserSection');
    const username = document.getElementById('navUsername');
    
    if (currentUser) {
        authSection.classList.add('d-none');
        userSection.classList.remove('d-none');
        username.textContent = currentUser.name;
    } else {
        authSection.classList.remove('d-none');
        userSection.classList.add('d-none');
    }
}

// Routing Functions
function navigateTo(route) {
    window.location.hash = route;
}

function handleRoute() {
    const hash = window.location.hash || '#/';
    currentRoute = hash;
    
    // Route Guards
    if (hash.includes('/dashboard') && !currentUser) {
        showToast('Please login to access dashboard', 'warning');
        navigateTo('#/login');
        return;
    }
    
    const appContent = document.getElementById('app-content');
    appContent.innerHTML = '';
    appContent.className = 'fade-in';
    
    switch (hash) {
        case '#/':
            renderHome();
            break;
        case '#/login':
            renderLogin();
            break;
        case '#/register':
            renderRegister();
            break;
        case '#/jobs':
            renderJobs();
            break;
        case '#/dashboard':
            renderDashboard();
            break;
        default:
            renderHome();
    }
}

// Render Functions
function renderHome() {
    document.getElementById('app-content').innerHTML = `
        <div class="hero-section">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-8 text-center hero-content">
                        <h1>Welcome to RecruitWorX</h1>
                        <p>The complete recruitment management solution for modern organizations</p>
                        <div class="d-flex gap-3 justify-content-center">
                            <a href="#/jobs" class="btn btn-light btn-lg">Browse Jobs</a>
                            <a href="#/login" class="btn btn-outline-light btn-lg">Get Started</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-briefcase fa-3x text-primary mb-3"></i>
                        <h5>Find Your Dream Job</h5>
                        <p>Browse through hundreds of job opportunities from top companies.</p>
                        <a href="#/jobs" class="btn btn-primary">View Jobs</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-users fa-3x text-primary mb-3"></i>
                        <h5>Manage Recruitment</h5>
                        <p>Streamline your hiring process with our comprehensive management tools.</p>
                        <a href="#/login" class="btn btn-primary">For Employers</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-body text-center">
                        <i class="fas fa-chart-line fa-3x text-primary mb-3"></i>
                        <h5>Track Progress</h5>
                        <p>Monitor applications and get insights with detailed analytics and reports.</p>
                        <a href="#/register" class="btn btn-primary">Get Started</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderLogin() {
    document.getElementById('app-content').innerHTML = `
        <div class="auth-card">
            <div class="card">
                <div class="card-body">
                    <h4 class="text-center mb-4">Login to RecruitWorX</h4>
                    
                    <ul class="nav nav-tabs auth-tabs mb-4" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#candidate-login">Candidate</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#hr-login">HR</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#admin-login">Admin</button>
                        </li>
                    </ul>
                    
                    <div class="tab-content">
                        <div class="tab-pane fade show active" id="candidate-login">
                            <form onsubmit="handleLogin(event, 'candidate')">
                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" name="email" value="john@example.com" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Password</label>
                                    <input type="password" class="form-control" name="password" value="candidate" required>
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Login as Candidate</button>
                            </form>
                        </div>
                        
                        <div class="tab-pane fade" id="hr-login">
                            <form onsubmit="handleLogin(event, 'hr')">
                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" name="email" value="hr@rw.com" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Password</label>
                                    <input type="password" class="form-control" name="password" value="hr" required>
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Login as HR</button>
                            </form>
                        </div>
                        
                        <div class="tab-pane fade" id="admin-login">
                            <form onsubmit="handleLogin(event, 'admin')">
                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" name="email" value="admin@rw.com" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Password</label>
                                    <input type="password" class="form-control" name="password" value="admin" required>
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Login as Admin</button>
                            </form>
                        </div>
                    </div>
                    
                    <div class="text-center mt-3">
                        <p>Don't have an account? <a href="#/register">Register here</a></p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderRegister() {
    document.getElementById('app-content').innerHTML = `
        <div class="auth-card">
            <div class="card">
                <div class="card-body">
                    <h4 class="text-center mb-4">Register as Candidate</h4>
                    
                    <form onsubmit="handleRegister(event)">
                        <div class="mb-3">
                            <label class="form-label">Full Name *</label>
                            <input type="text" class="form-control" name="name" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email *</label>
                            <input type="email" class="form-control" name="email" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Phone *</label>
                            <input type="tel" class="form-control" name="phone" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Password *</label>
                            <input type="password" class="form-control" name="password" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Skills (comma separated)</label>
                            <input type="text" class="form-control" name="skills" placeholder="e.g., JavaScript, React, Node.js">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Resume Upload</label>
                            <input type="file" class="form-control" name="resume" accept=".pdf,.doc,.docx" onchange="handleResumeUpload(event)">
                            <div class="form-text">Upload your resume (PDF, DOC, DOCX)</div>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Register</button>
                    </form>
                    
                    <div class="text-center mt-3">
                        <p>Already have an account? <a href="#/login">Login here</a></p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderJobs() {
    const activeJobs = jobs.filter(job => job.status === 'active');
    
    document.getElementById('app-content').innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Available Jobs</h2>
            <span class="badge bg-primary fs-6">${activeJobs.length} Jobs Available</span>
        </div>
        
        <div class="search-filters">
            <div class="row">
                <div class="col-md-4 filter-group">
                    <label class="form-label">Search Keywords</label>
                    <input type="text" class="form-control" id="jobSearch" placeholder="Job title, skills..." onkeyup="filterJobs()">
                </div>
                <div class="col-md-3 filter-group">
                    <label class="form-label">Location</label>
                    <input type="text" class="form-control" id="locationFilter" placeholder="City, State" onkeyup="filterJobs()">
                </div>
                <div class="col-md-3 filter-group">
                    <label class="form-label">Job Type</label>
                    <select class="form-control" id="typeFilter" onchange="filterJobs()">
                        <option value="">All Types</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                    </select>
                </div>
                <div class="col-md-2 filter-group d-flex align-items-end">
                    <button class="btn btn-outline-primary w-100" onclick="clearFilters()">Clear</button>
                </div>
            </div>
        </div>
        
        <div id="jobsList">
            ${renderJobsList(activeJobs)}
        </div>
    `;
}

function renderJobsList(jobsToRender) {
    if (jobsToRender.length === 0) {
        return `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h4>No jobs found</h4>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
    }
    
    return jobsToRender.map(job => `
        <div class="card job-card mb-3">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <h5 class="card-title">${job.title}</h5>
                        <p class="card-text">${job.description.substring(0, 150)}...</p>
                        <div class="job-meta">
                            <span><i class="fas fa-map-marker-alt"></i>${job.location}</span>
                            <span class="ms-3"><i class="fas fa-clock"></i>${job.type}</span>
                            <span class="ms-3"><i class="fas fa-dollar-sign"></i>${job.salary || 'Competitive'}</span>
                        </div>
                        <div class="mt-2">
                            ${job.skills.split(',').map(skill => `<span class="skill-tag">${skill.trim()}</span>`).join('')}
                        </div>
                    </div>
                    <div class="col-md-4 text-end">
                        <div class="mb-2">
                            <small class="text-muted">Posted: ${formatDate(job.postedDate)}</small>
                        </div>
                        <div class="mb-2">
                            <small class="text-muted">Deadline: ${formatDate(job.deadline)}</small>
                        </div>
                        ${currentUser && currentUser.role === 'candidate' ? 
                            `<button class="btn btn-primary" onclick="applyForJob(${job.id})" ${hasApplied(job.id) ? 'disabled' : ''}>
                                ${hasApplied(job.id) ? 'Applied' : 'Apply Now'}
                            </button>` : 
                            `<a href="#/login" class="btn btn-primary">Login to Apply</a>`
                        }
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderDashboard() {
    let dashboardContent = '';
    
    if (currentUser.role === 'admin') {
        dashboardContent = renderAdminDashboard();
    } else if (currentUser.role === 'hr') {
        dashboardContent = renderHRDashboard();
    } else if (currentUser.role === 'candidate') {
        dashboardContent = renderCandidateDashboard();
    }
    
    document.getElementById('app-content').innerHTML = dashboardContent;
    
    // Initialize charts for admin dashboard
    if (currentUser.role === 'admin') {
        setTimeout(initializeCharts, 100);
    }
}

function renderAdminDashboard() {
    const totalJobs = jobs.length;
    const totalApplications = applications.length;
    const totalCandidates = users.filter(u => u.role === 'candidate').length + candidates.length;
    const filledPositions = applications.filter(a => a.status === 'Selected').length;
    
    return `
        <h2 class="mb-4">Admin Dashboard</h2>
        
        <div class="row mb-4">
            <div class="col-md-3 mb-3">
                <div class="card dashboard-card">
                    <div class="card-body text-center">
                        <div class="dashboard-stat">${totalJobs}</div>
                        <div class="dashboard-label">Total Jobs</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card dashboard-card success">
                    <div class="card-body text-center">
                        <div class="dashboard-stat">${totalApplications}</div>
                        <div class="dashboard-label">Applications</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card dashboard-card warning">
                    <div class="card-body text-center">
                        <div class="dashboard-stat">${totalCandidates}</div>
                        <div class="dashboard-label">Candidates</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card dashboard-card info">
                    <div class="card-body text-center">
                        <div class="dashboard-stat">${filledPositions}</div>
                        <div class="dashboard-label">Positions Filled</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-8 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Applications per Job</h5>
                    </div>
                    <div class="card-body">
                        <div class="chart-container">
                            <canvas id="applicationsChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Quick Stats</h5>
                    </div>
                    <div class="card-body">
                        <div class="quick-stat mb-3">
                            <h3>${applications.filter(a => a.status === 'Applied').length}</h3>
                            <p>New Applications</p>
                        </div>
                        <div class="quick-stat mb-3">
                            <h3>${applications.filter(a => a.status === 'Shortlisted').length}</h3>
                            <p>Shortlisted</p>
                        </div>
                        <div class="quick-stat">
                            <h3>${applications.filter(a => a.status === 'Interviewed').length}</h3>
                            <p>Interviewed</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#manage-jobs">Manage Jobs</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#manage-users">Manage Users</button>
            </li>
        </ul>
        
        <div class="tab-content">
            <div class="tab-pane fade show active" id="manage-jobs">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>Job Postings</h5>
                    <button class="btn btn-primary" onclick="openJobModal()">Add New Job</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Location</th>
                                <th>Type</th>
                                <th>Applications</th>
                                <th>Posted Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${jobs.map(job => `
                                <tr>
                                    <td>${job.title}</td>
                                    <td>${job.location}</td>
                                    <td><span class="badge bg-info">${job.type}</span></td>
                                    <td>${applications.filter(a => a.jobId === job.id).length}</td>
                                    <td>${formatDate(job.postedDate)}</td>
                                    <td><span class="badge ${job.status === 'active' ? 'bg-success' : 'bg-secondary'}">${job.status}</span></td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary" onclick="editJob(${job.id})">Edit</button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteJob(${job.id})">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="tab-pane fade" id="manage-users">
                <h5>User Management</h5>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.filter(u => u.role !== 'admin').map(user => `
                                <tr>
                                    <td>${user.name}</td>
                                    <td>${user.email}</td>
                                    <td><span class="badge bg-primary">${user.role}</span></td>
                                    <td><span class="badge bg-success">Active</span></td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-warning">Disable</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderHRDashboard() {
    const myJobs = jobs.filter(job => job.postedBy === currentUser.id);
    const myApplications = applications.filter(app => 
        myJobs.some(job => job.id === app.jobId)
    );
    
    return `
        <h2 class="mb-4">HR Dashboard</h2>
        
        <div class="row mb-4">
            <div class="col-md-3 mb-3">
                <div class="card dashboard-card">
                    <div class="card-body text-center">
                        <div class="dashboard-stat">${myJobs.length}</div>
                        <div class="dashboard-label">My Job Posts</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card dashboard-card success">
                    <div class="card-body text-center">
                        <div class="dashboard-stat">${myApplications.length}</div>
                        <div class="dashboard-label">Total Applications</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card dashboard-card warning">
                    <div class="card-body text-center">
                        <div class="dashboard-stat">${myApplications.filter(a => a.status === 'Shortlisted').length}</div>
                        <div class="dashboard-label">Shortlisted</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card dashboard-card info">
                    <div class="card-body text-center">
                        <div class="dashboard-stat">${myApplications.filter(a => a.status === 'Selected').length}</div>
                        <div class="dashboard-label">Hired</div>
                    </div>
                </div>
            </div>
        </div>
        
        <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#my-jobs">My Jobs</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#applicants">Applicants</button>
            </li>
        </ul>
        
        <div class="tab-content">
            <div class="tab-pane fade show active" id="my-jobs">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>My Job Postings</h5>
                    <button class="btn btn-primary" onclick="openJobModal()">Post New Job</button>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Location</th>
                                <th>Applications</th>
                                <th>Posted Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${myJobs.map(job => `
                                <tr>
                                    <td>${job.title}</td>
                                    <td>${job.location}</td>
                                    <td><span class="badge bg-primary">${applications.filter(a => a.jobId === job.id).length}</span></td>
                                    <td>${formatDate(job.postedDate)}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary" onclick="editJob(${job.id})">Edit</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="tab-pane fade" id="applicants">
                <h5>Job Applicants</h5>
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Job</th>
                                <th>Applied Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${myApplications.map(app => {
                                const candidate = users.find(u => u.id === app.candidateId) || 
                                               candidates.find(c => c.id === app.candidateId);
                                const job = jobs.find(j => j.id === app.jobId);
                                return `
                                    <tr>
                                        <td>${candidate ? candidate.name : 'Unknown'}</td>
                                        <td>${job ? job.title : 'Unknown'}</td>
                                        <td>${formatDate(app.appliedDate)}</td>
                                        <td>
                                            <select class="form-select form-select-sm status-dropdown" onchange="changeApplicationStatus(${app.id}, this.value)">
                                                <option value="Applied" ${app.status === 'Applied' ? 'selected' : ''}>Applied</option>
                                                <option value="Shortlisted" ${app.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
                                                <option value="Interviewed" ${app.status === 'Interviewed' ? 'selected' : ''}>Interviewed</option>
                                                <option value="Selected" ${app.status === 'Selected' ? 'selected' : ''}>Selected</option>
                                                <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                                            </select>
                                        </td>
                                        <td class="applicant-actions">
                                            <button class="btn btn-sm btn-outline-info" onclick="openInterviewModal(${app.id})">Schedule Interview</button>
                                            ${app.interview ? `
                                                <div class="interview-info mt-1">
                                                    <strong>Interview:</strong> ${new Date(app.interview.dateTime).toLocaleString()}<br>
                                                    <strong>Location:</strong> ${app.interview.location}
                                                </div>
                                            ` : ''}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderCandidateDashboard() {
    const myApplications = applications.filter(app => app.candidateId === currentUser.id);
    
    return `
        <h2 class="mb-4">My Dashboard</h2>
        
        <div class="row mb-4">
            <div class="col-md-3 mb-3">
                <div class="card dashboard-card">
                    <div class="card-body text-center">
                        <div class="dashboard-stat">${myApplications.length}</div>
                        <div class="dashboard-label">Applications</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card dashboard-card warning">
                    <div class="card-body text-center">
                        <div class="dashboard-stat">${myApplications.filter(a => a.status === 'Shortlisted').length}</div>
                        <div class="dashboard-label">Shortlisted</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card dashboard-card info">
                    <div class="card-body text-center">
                        <div class="dashboard-stat">${myApplications.filter(a => a.status === 'Interviewed').length}</div>
                        <div class="dashboard-label">Interviewed</div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="card dashboard-card success">
                    <div class="card-body text-center">
                        <div class="dashboard-stat">${myApplications.filter(a => a.status === 'Selected').length}</div>
                        <div class="dashboard-label">Selected</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">My Job Applications</h5>
            </div>
            <div class="card-body">
                ${myApplications.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-briefcase"></i>
                        <h4>No applications yet</h4>
                        <p>Start applying for jobs to see your applications here.</p>
                        <a href="#/jobs" class="btn btn-primary">Browse Jobs</a>
                    </div>
                ` : `
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Job Title</th>
                                    <th>Company Location</th>
                                    <th>Applied Date</th>
                                    <th>Status</th>
                                    <th>Interview Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${myApplications.map(app => {
                                    const job = jobs.find(j => j.id === app.jobId);
                                    return `
                                        <tr>
                                            <td>${job ? job.title : 'Unknown'}</td>
                                            <td>${job ? job.location : 'Unknown'}</td>
                                            <td>${formatDate(app.appliedDate)}</td>
                                            <td><span class="badge ${getStatusBadgeClass(app.status)}">${app.status}</span></td>
                                            <td>
                                                ${app.interview ? `
                                                    <div class="interview-info">
                                                        <strong>Date:</strong> ${new Date(app.interview.dateTime).toLocaleString()}<br>
                                                        <strong>Location:</strong> ${app.interview.location}
                                                        ${app.interview.notes ? `<br><strong>Notes:</strong> ${app.interview.notes}` : ''}
                                                    </div>
                                                ` : '<span class="text-muted">Not scheduled</span>'}
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Event Handlers
function handleLogin(event, role) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    login(email, password, role);
}

function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    const newUser = {
        id: nextId.users++,
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        role: 'candidate',
        skills: formData.get('skills') || ''
    };
    
    // Check if email already exists
    if (users.some(u => u.email === newUser.email)) {
        showToast('Email already registered. Please use a different email.', 'danger');
        return;
    }
    
    users.push(newUser);
    showToast('Registration successful! Please login.', 'success');
    navigateTo('#/login');
}

function handleResumeUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Simulate resume parsing
        const fileName = file.name.toLowerCase();
        const simulatedSkills = [];
        
        // Extract skills from filename (simulation)
        if (fileName.includes('javascript') || fileName.includes('js')) simulatedSkills.push('JavaScript');
        if (fileName.includes('react')) simulatedSkills.push('React');
        if (fileName.includes('node')) simulatedSkills.push('Node.js');
        if (fileName.includes('python')) simulatedSkills.push('Python');
        if (fileName.includes('java')) simulatedSkills.push('Java');
        
        if (simulatedSkills.length > 0) {
            showToast(`Resume parsed! Detected skills: ${simulatedSkills.join(', ')}`, 'info');
        }
    }
}

function filterJobs() {
    const searchTerm = document.getElementById('jobSearch').value.toLowerCase();
    const locationFilter = document.getElementById('locationFilter').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm) || 
                            job.skills.toLowerCase().includes(searchTerm) ||
                            job.description.toLowerCase().includes(searchTerm);
        const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter);
        const matchesType = !typeFilter || job.type === typeFilter;
        
        return job.status === 'active' && matchesSearch && matchesLocation && matchesType;
    });
    
    document.getElementById('jobsList').innerHTML = renderJobsList(filteredJobs);
}

function clearFilters() {
    document.getElementById('jobSearch').value = '';
    document.getElementById('locationFilter').value = '';
    document.getElementById('typeFilter').value = '';
    filterJobs();
}

function hasApplied(jobId) {
    return currentUser && applications.some(app => 
        app.jobId === jobId && app.candidateId === currentUser.id
    );
}

function applyForJob(jobId) {
    if (!currentUser || currentUser.role !== 'candidate') {
        showToast('Please login as a candidate to apply', 'warning');
        return;
    }
    
    if (hasApplied(jobId)) {
        showToast('You have already applied for this job', 'info');
        return;
    }
    
    const newApplication = {
        id: nextId.applications++,
        jobId: jobId,
        candidateId: currentUser.id,
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'Applied',
        resume: 'resume.pdf',
        coverLetter: 'Cover letter content...',
        interview: null
    };
    
    applications.push(newApplication);
    showToast('Application submitted successfully!', 'success');
    
    // Refresh the jobs list to update apply button
    if (currentRoute === '#/jobs') {
        renderJobs();
    }
}

function changeApplicationStatus(applicationId, newStatus) {
    const application = applications.find(a => a.id === applicationId);
    if (application) {
        const oldStatus = application.status;
        application.status = newStatus;
        
        // Find candidate name
        const candidate = users.find(u => u.id === application.candidateId) || 
                         candidates.find(c => c.id === application.candidateId);
        const candidateName = candidate ? candidate.name : 'Candidate';
        
        showToast(`${candidateName}'s application status changed from ${oldStatus} to ${newStatus}`, 'success');
        
        // Simulate email notification
        console.log(`📧 Email sent to ${candidate?.email}: Your application status has been updated to ${newStatus}`);
    }
}

function openJobModal(jobId = null) {
    const modal = new bootstrap.Modal(document.getElementById('jobModal'));
    const form = document.getElementById('jobForm');
    const title = document.getElementById('jobModalTitle');
    
    if (jobId) {
        const job = jobs.find(j => j.id === jobId);
        if (job) {
            title.textContent = 'Edit Job';
            document.getElementById('jobId').value = job.id;
            document.getElementById('jobTitle').value = job.title;
            document.getElementById('jobDescription').value = job.description;
            document.getElementById('jobLocation').value = job.location;
            document.getElementById('jobType').value = job.type;
            document.getElementById('jobSalary').value = job.salary || '';
            document.getElementById('jobDeadline').value = job.deadline;
            document.getElementById('jobSkills').value = job.skills;
        }
    } else {
        title.textContent = 'Add New Job';
        form.reset();
        document.getElementById('jobId').value = '';
    }
    
    modal.show();
}

function saveJob() {
    const form = document.getElementById('jobForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const jobId = document.getElementById('jobId').value;
    const jobData = {
        title: document.getElementById('jobTitle').value,
        description: document.getElementById('jobDescription').value,
        location: document.getElementById('jobLocation').value,
        type: document.getElementById('jobType').value,
        salary: document.getElementById('jobSalary').value,
        deadline: document.getElementById('jobDeadline').value,
        skills: document.getElementById('jobSkills').value,
        status: 'active'
    };
    
    if (jobId) {
        // Edit existing job
        const job = jobs.find(j => j.id === parseInt(jobId));
        if (job) {
            Object.assign(job, jobData);
            showToast('Job updated successfully!', 'success');
        }
    } else {
        // Add new job
        const newJob = {
            id: nextId.jobs++,
            ...jobData,
            postedBy: currentUser.id,
            postedDate: new Date().toISOString().split('T')[0]
        };
        jobs.push(newJob);
        showToast('Job posted successfully!', 'success');
    }
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('jobModal'));
    modal.hide();
    
    // Refresh dashboard
    renderDashboard();
}

function editJob(jobId) {
    openJobModal(jobId);
}

function deleteJob(jobId) {
    if (confirm('Are you sure you want to delete this job?')) {
        const jobIndex = jobs.findIndex(j => j.id === jobId);
        if (jobIndex !== -1) {
            jobs.splice(jobIndex, 1);
            showToast('Job deleted successfully!', 'success');
            renderDashboard();
        }
    }
}

function openInterviewModal(applicationId) {
    const modal = new bootstrap.Modal(document.getElementById('interviewModal'));
    document.getElementById('interviewApplicationId').value = applicationId;
    
    // Pre-fill with existing interview data if available
    const application = applications.find(a => a.id === applicationId);
    if (application && application.interview) {
        document.getElementById('interviewDateTime').value = application.interview.dateTime;
        document.getElementById('interviewLocation').value = application.interview.location;
        document.getElementById('interviewNotes').value = application.interview.notes || '';
    } else {
        document.getElementById('interviewForm').reset();
    }
    
    modal.show();
}

function scheduleInterview() {
    const form = document.getElementById('interviewForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const applicationId = parseInt(document.getElementById('interviewApplicationId').value);
    const application = applications.find(a => a.id === applicationId);
    
    if (application) {
        application.interview = {
            dateTime: document.getElementById('interviewDateTime').value,
            location: document.getElementById('interviewLocation').value,
            notes: document.getElementById('interviewNotes').value
        };
        
        // Update status to Interviewed if it's not already a later stage
        if (application.status === 'Applied' || application.status === 'Shortlisted') {
            application.status = 'Interviewed';
        }
        
        const candidate = users.find(u => u.id === application.candidateId) || 
                         candidates.find(c => c.id === application.candidateId);
        
        showToast(`Interview scheduled for ${candidate?.name || 'candidate'}`, 'success');
        
        // Simulate email notification
        console.log(`📧 Interview scheduled for ${candidate?.email}: ${new Date(application.interview.dateTime).toLocaleString()} at ${application.interview.location}`);
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('interviewModal'));
        modal.hide();
        
        // Refresh dashboard
        renderDashboard();
    }
}

function initializeCharts() {
    const ctx = document.getElementById('applicationsChart');
    if (!ctx) return;
    
    // Calculate applications per job
    const jobApplicationData = jobs.map(job => ({
        job: job.title,
        applications: applications.filter(app => app.jobId === job.id).length
    }));
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: jobApplicationData.map(item => item.job),
            datasets: [{
                label: 'Applications',
                data: jobApplicationData.map(item => item.applications),
                backgroundColor: [
                    '#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'
                ].slice(0, jobApplicationData.length),
                borderColor: '#15223b',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Handle route changes
    window.addEventListener('hashchange', handleRoute);
    
    // Handle initial route
    handleRoute();
    
    // Update navigation based on current user
    updateNavigation();
});

// Global functions for HTML onclick handlers
window.login = login;
window.logout = logout;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleResumeUpload = handleResumeUpload;
window.filterJobs = filterJobs;
window.clearFilters = clearFilters;
window.applyForJob = applyForJob;
window.changeApplicationStatus = changeApplicationStatus;
window.openJobModal = openJobModal;
window.saveJob = saveJob;
window.editJob = editJob;
window.deleteJob = deleteJob;
window.openInterviewModal = openInterviewModal;
window.scheduleInterview = scheduleInterview;