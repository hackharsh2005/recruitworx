// Enhanced RecruitWorX Application
class RecruitWorXApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'home';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthentication();
        this.handleRouting();
        this.initializeAnimations();
    }

    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const route = e.target.getAttribute('href').substring(1);
                this.navigate(route);
            }
        });

        // Forms
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'loginForm') {
                e.preventDefault();
                this.handleLogin(e.target);
            } else if (e.target.id === 'registerForm') {
                e.preventDefault();
                this.handleRegister(e.target);
            } else if (e.target.id === 'jobForm') {
                e.preventDefault();
                this.handleJobForm(e.target);
            } else if (e.target.id === 'jobSearchForm') {
                e.preventDefault();
                this.handleJobSearch(e.target);
            }
        });

        // Window events
        window.addEventListener('popstate', () => this.handleRouting());
        window.addEventListener('load', () => this.handleRouting());
    }

    initializeAnimations() {
        // Add smooth scrolling
        document.documentElement.style.scrollBehavior = 'smooth';
        
        // Initialize intersection observer for animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        });

        // Observe all cards and sections
        document.querySelectorAll('.card, .hero-section').forEach(el => {
            observer.observe(el);
        });
    }

    async checkAuthentication() {
        try {
            const response = await fetch('api/auth.php?action=check');
            const data = await response.json();
            
            if (data.success && data.authenticated) {
                this.currentUser = data.user;
                this.updateNavigation();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }

    updateNavigation() {
        const authSection = document.getElementById('navAuthSection');
        const userSection = document.getElementById('navUserSection');
        const navUsername = document.getElementById('navUsername');

        if (this.currentUser) {
            authSection.classList.add('d-none');
            userSection.classList.remove('d-none');
            navUsername.textContent = this.currentUser.full_name;
        } else {
            authSection.classList.remove('d-none');
            userSection.classList.add('d-none');
        }
    }

    handleRouting() {
        const hash = window.location.hash.substring(1) || 'home';
        this.navigate(hash, false);
    }

    navigate(route, pushState = true) {
        if (pushState) {
            history.pushState(null, null, `#${route}`);
        }

        this.currentPage = route;
        this.renderPage(route);
    }

    async renderPage(route) {
        const content = document.getElementById('app-content');
        content.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>';

        try {
            let html = '';
            
            switch (route) {
                case 'home':
                    html = await this.renderHomePage();
                    break;
                case 'jobs':
                    html = await this.renderJobsPage();
                    break;
                case 'login':
                    html = this.renderLoginPage();
                    break;
                case 'register':
                    html = this.renderRegisterPage();
                    break;
                case 'dashboard':
                    html = await this.renderDashboard();
                    break;
                case 'applications':
                    html = await this.renderApplicationsPage();
                    break;
                case 'interviews':
                    html = await this.renderInterviewsPage();
                    break;
                default:
                    if (route.startsWith('job/')) {
                        const jobId = route.split('/')[1];
                        html = await this.renderJobDetail(jobId);
                    } else {
                        html = '<div class="alert alert-warning">Page not found</div>';
                    }
            }

            content.innerHTML = html;
            this.initializePageSpecificFeatures(route);
            
        } catch (error) {
            console.error('Page render error:', error);
            content.innerHTML = '<div class="alert alert-danger">Error loading page</div>';
        }
    }

    async renderHomePage() {
        const jobsResponse = await fetch('api/jobs.php');
        const jobsData = await jobsResponse.json();
        const recentJobs = jobsData.success ? jobsData.jobs.slice(0, 3) : [];

        return `
            <div class="hero-section">
                <div class="container">
                    <div class="row align-items-center">
                        <div class="col-lg-6">
                            <div class="hero-content">
                                <h1 class="display-4 fw-bold mb-4">Find Your Dream Job</h1>
                                <p class="lead mb-4">Connect with top employers and discover opportunities that match your skills and aspirations.</p>
                                <div class="d-flex gap-3">
                                    <a href="#jobs" class="btn btn-light btn-lg px-4">Browse Jobs</a>
                                    <a href="#register" class="btn btn-outline-light btn-lg px-4">Get Started</a>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="hero-image text-center">
                                <i class="fas fa-briefcase" style="font-size: 15rem; opacity: 0.1;"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="container py-5">
                <div class="row">
                    <div class="col-lg-4 mb-4">
                        <div class="card h-100 text-center border-0 shadow-sm">
                            <div class="card-body p-4">
                                <div class="mb-3">
                                    <i class="fas fa-search text-primary" style="font-size: 3rem;"></i>
                                </div>
                                <h5 class="card-title">Search Jobs</h5>
                                <p class="card-text">Find the perfect job that matches your skills and preferences with our advanced search filters.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 mb-4">
                        <div class="card h-100 text-center border-0 shadow-sm">
                            <div class="card-body p-4">
                                <div class="mb-3">
                                    <i class="fas fa-file-alt text-success" style="font-size: 3rem;"></i>
                                </div>
                                <h5 class="card-title">Apply Easily</h5>
                                <p class="card-text">Submit your applications with just a few clicks and track their progress in real-time.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 mb-4">
                        <div class="card h-100 text-center border-0 shadow-sm">
                            <div class="card-body p-4">
                                <div class="mb-3">
                                    <i class="fas fa-handshake text-warning" style="font-size: 3rem;"></i>
                                </div>
                                <h5 class="card-title">Get Hired</h5>
                                <p class="card-text">Connect with employers and land your dream job through our streamlined hiring process.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row mt-5">
                    <div class="col-12">
                        <h2 class="text-center mb-5">Latest Job Opportunities</h2>
                        <div class="row">
                            ${recentJobs.map(job => `
                                <div class="col-lg-4 mb-4">
                                    <div class="card job-card h-100 shadow-sm">
                                        <div class="card-body">
                                            <h5 class="card-title">${job.title}</h5>
                                            <p class="card-text">${job.description.substring(0, 100)}...</p>
                                            <div class="job-meta mb-3">
                                                <div><i class="fas fa-map-marker-alt"></i> ${job.location}</div>
                                                <div><i class="fas fa-clock"></i> ${job.job_type}</div>
                                                ${job.salary_range ? `<div><i class="fas fa-dollar-sign"></i> ${job.salary_range}</div>` : ''}
                                            </div>
                                            <a href="#job/${job.id}" class="btn btn-primary">View Details</a>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="text-center mt-4">
                            <a href="#jobs" class="btn btn-outline-primary btn-lg">View All Jobs</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async renderJobsPage() {
        const response = await fetch('api/jobs.php');
        const data = await response.json();
        const jobs = data.success ? data.jobs : [];

        return `
            <div class="container py-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h1>Job Opportunities</h1>
                    ${this.currentUser && ['admin', 'hr'].includes(this.currentUser.role) ? 
                        '<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#jobModal" onclick="app.openJobModal()">Post New Job</button>' : ''}
                </div>

                <div class="search-filters mb-4">
                    <form id="jobSearchForm">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <input type="text" class="form-control" name="search" placeholder="Search jobs, skills, or keywords">
                            </div>
                            <div class="col-md-3 mb-3">
                                <input type="text" class="form-control" name="location" placeholder="Location">
                            </div>
                            <div class="col-md-3 mb-3">
                                <select class="form-control" name="job_type">
                                    <option value="">All Job Types</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>
                            <div class="col-md-2 mb-3">
                                <button type="submit" class="btn btn-primary w-100">Search</button>
                            </div>
                        </div>
                    </form>
                </div>

                <div id="jobsList">
                    ${jobs.length > 0 ? jobs.map(job => `
                        <div class="card job-card mb-4 shadow-sm">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-8">
                                        <h5 class="card-title">${job.title}</h5>
                                        <p class="card-text">${job.description.substring(0, 200)}...</p>
                                        <div class="job-meta">
                                            <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                                            <span><i class="fas fa-clock"></i> ${job.job_type}</span>
                                            ${job.salary_range ? `<span><i class="fas fa-dollar-sign"></i> ${job.salary_range}</span>` : ''}
                                            <span><i class="fas fa-users"></i> ${job.application_count} applications</span>
                                        </div>
                                        ${job.required_skills ? `
                                            <div class="mt-2">
                                                ${job.required_skills.split(',').map(skill => 
                                                    `<span class="skill-tag">${skill.trim()}</span>`
                                                ).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div class="col-md-4 text-end">
                                        <div class="mb-2">
                                            <small class="text-muted">Posted ${new Date(job.created_at).toLocaleDateString()}</small>
                                        </div>
                                        <a href="#job/${job.id}" class="btn btn-primary">View Details</a>
                                        ${this.currentUser && ['admin', 'hr'].includes(this.currentUser.role) ? `
                                            <div class="mt-2">
                                                <button class="btn btn-sm btn-outline-primary" onclick="app.editJob(${job.id})">Edit</button>
                                                <button class="btn btn-sm btn-outline-danger" onclick="app.deleteJob(${job.id})">Delete</button>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('') : '<div class="empty-state"><i class="fas fa-briefcase"></i><h3>No jobs found</h3><p>Check back later for new opportunities.</p></div>'}
                </div>
            </div>
        `;
    }

    async renderJobDetail(jobId) {
        const response = await fetch(`api/jobs.php?id=${jobId}`);
        const data = await response.json();
        
        if (!data.success) {
            return '<div class="alert alert-danger">Job not found</div>';
        }

        const job = data.job;
        const hasApplied = this.currentUser ? await this.checkIfApplied(jobId) : false;

        return `
            <div class="container py-4">
                <div class="row">
                    <div class="col-lg-8">
                        <div class="card shadow-sm">
                            <div class="card-body p-4">
                                <h1 class="card-title mb-3">${job.title}</h1>
                                <div class="job-meta mb-4">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <p><i class="fas fa-map-marker-alt"></i> ${job.location}</p>
                                            <p><i class="fas fa-clock"></i> ${job.job_type}</p>
                                        </div>
                                        <div class="col-md-6">
                                            ${job.salary_range ? `<p><i class="fas fa-dollar-sign"></i> ${job.salary_range}</p>` : ''}
                                            <p><i class="fas fa-calendar"></i> Posted ${new Date(job.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <h3>Job Description</h3>
                                <div class="mb-4">${job.description.replace(/\n/g, '<br>')}</div>
                                
                                ${job.required_skills ? `
                                    <h3>Required Skills</h3>
                                    <div class="mb-4">
                                        ${job.required_skills.split(',').map(skill => 
                                            `<span class="skill-tag">${skill.trim()}</span>`
                                        ).join('')}
                                    </div>
                                ` : ''}
                                
                                ${job.deadline ? `
                                    <div class="alert alert-info">
                                        <i class="fas fa-exclamation-circle"></i>
                                        Application deadline: ${new Date(job.deadline).toLocaleDateString()}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-4">
                        <div class="card shadow-sm">
                            <div class="card-body">
                                <h5>Quick Stats</h5>
                                <p><strong>${job.application_count}</strong> applications received</p>
                                <p><strong>Posted by:</strong> ${job.created_by_name}</p>
                                
                                ${this.currentUser && this.currentUser.role === 'candidate' ? `
                                    <div class="mt-4">
                                        ${hasApplied ? 
                                            '<button class="btn btn-success w-100" disabled><i class="fas fa-check"></i> Applied</button>' :
                                            '<button class="btn btn-primary w-100" onclick="app.showApplyModal(' + job.id + ')">Apply Now</button>'
                                        }
                                    </div>
                                ` : ''}
                                
                                ${!this.currentUser ? `
                                    <div class="mt-4">
                                        <a href="#login" class="btn btn-primary w-100">Login to Apply</a>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLoginPage() {
        return `
            <div class="container py-5">
                <div class="row justify-content-center">
                    <div class="col-md-6 col-lg-4">
                        <div class="card auth-card shadow">
                            <div class="card-body p-4">
                                <h2 class="text-center mb-4">Login</h2>
                                <form id="loginForm">
                                    <div class="mb-3">
                                        <label for="loginUsername" class="form-label">Username or Email</label>
                                        <input type="text" class="form-control" id="loginUsername" name="username" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="loginPassword" class="form-label">Password</label>
                                        <input type="password" class="form-control" id="loginPassword" name="password" required>
                                    </div>
                                    <button type="submit" class="btn btn-primary w-100">Login</button>
                                </form>
                                <div class="text-center mt-3">
                                    <p>Don't have an account? <a href="#register">Register here</a></p>
                                </div>
                                <div class="mt-3">
                                    <small class="text-muted">
                                        <strong>Demo Accounts:</strong><br>
                                        Admin: admin / password<br>
                                        HR: hr_manager / password<br>
                                        Candidate: john_doe / password
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderRegisterPage() {
        return `
            <div class="container py-5">
                <div class="row justify-content-center">
                    <div class="col-md-6 col-lg-5">
                        <div class="card auth-card shadow">
                            <div class="card-body p-4">
                                <h2 class="text-center mb-4">Register</h2>
                                <form id="registerForm">
                                    <div class="mb-3">
                                        <label for="regFullName" class="form-label">Full Name</label>
                                        <input type="text" class="form-control" id="regFullName" name="full_name" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="regUsername" class="form-label">Username</label>
                                        <input type="text" class="form-control" id="regUsername" name="username" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="regEmail" class="form-label">Email</label>
                                        <input type="email" class="form-control" id="regEmail" name="email" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="regPhone" class="form-label">Phone</label>
                                        <input type="tel" class="form-control" id="regPhone" name="phone">
                                    </div>
                                    <div class="mb-3">
                                        <label for="regPassword" class="form-label">Password</label>
                                        <input type="password" class="form-control" id="regPassword" name="password" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="regConfirmPassword" class="form-label">Confirm Password</label>
                                        <input type="password" class="form-control" id="regConfirmPassword" name="confirm_password" required>
                                    </div>
                                    <button type="submit" class="btn btn-primary w-100">Register</button>
                                </form>
                                <div class="text-center mt-3">
                                    <p>Already have an account? <a href="#login">Login here</a></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async renderDashboard() {
        if (!this.currentUser) {
            this.navigate('login');
            return '';
        }

        const response = await fetch('api/dashboard.php');
        const data = await response.json();

        if (!data.success) {
            return '<div class="alert alert-danger">Error loading dashboard</div>';
        }

        if (this.currentUser.role === 'candidate') {
            return this.renderCandidateDashboard(data);
        } else {
            return this.renderHRDashboard(data);
        }
    }

    renderCandidateDashboard(data) {
        const stats = data.stats;
        
        return `
            <div class="container py-4">
                <h1 class="mb-4">Welcome back, ${this.currentUser.full_name}!</h1>
                
                <div class="row mb-4">
                    <div class="col-md-3 mb-3">
                        <div class="quick-stat">
                            <h3>${stats.total_applications || 0}</h3>
                            <p>Total Applications</p>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="quick-stat">
                            <h3>${stats.shortlisted || 0}</h3>
                            <p>Shortlisted</p>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="quick-stat">
                            <h3>${stats.interviewed || 0}</h3>
                            <p>Interviewed</p>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="quick-stat">
                            <h3>${stats.selected || 0}</h3>
                            <p>Selected</p>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-lg-8">
                        <div class="card shadow-sm">
                            <div class="card-header">
                                <h5 class="mb-0">Recent Applications</h5>
                            </div>
                            <div class="card-body">
                                ${data.recent_applications.length > 0 ? `
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Job Title</th>
                                                    <th>Location</th>
                                                    <th>Status</th>
                                                    <th>Applied Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${data.recent_applications.map(app => `
                                                    <tr>
                                                        <td><a href="#job/${app.job_id}">${app.title}</a></td>
                                                        <td>${app.location}</td>
                                                        <td><span class="badge status-${app.status}">${app.status}</span></td>
                                                        <td>${new Date(app.applied_at).toLocaleDateString()}</td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                ` : '<p class="text-muted">No applications yet. <a href="#jobs">Browse jobs</a> to get started!</p>'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-4">
                        <div class="card shadow-sm">
                            <div class="card-header">
                                <h5 class="mb-0">Upcoming Interviews</h5>
                            </div>
                            <div class="card-body">
                                ${data.upcoming_interviews.length > 0 ? 
                                    data.upcoming_interviews.map(interview => `
                                        <div class="mb-3 p-3 border rounded">
                                            <h6>${interview.job_title}</h6>
                                            <p class="mb-1"><i class="fas fa-calendar"></i> ${new Date(interview.interview_date).toLocaleString()}</p>
                                            <p class="mb-0"><i class="fas fa-map-marker-alt"></i> ${interview.location}</p>
                                        </div>
                                    `).join('') : 
                                    '<p class="text-muted">No upcoming interviews</p>'
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderHRDashboard(data) {
        const stats = data.stats;
        
        return `
            <div class="container py-4">
                <h1 class="mb-4">HR Dashboard</h1>
                
                <div class="row mb-4">
                    <div class="col-md-3 mb-3">
                        <div class="dashboard-card card text-white">
                            <div class="card-body">
                                <div class="dashboard-stat">${stats.total_jobs || 0}</div>
                                <div class="dashboard-label">Active Jobs</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="dashboard-card card text-white success">
                            <div class="card-body">
                                <div class="dashboard-stat">${stats.total_applications || 0}</div>
                                <div class="dashboard-label">Total Applications</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="dashboard-card card text-white warning">
                            <div class="card-body">
                                <div class="dashboard-stat">${stats.shortlisted || 0}</div>
                                <div class="dashboard-label">Shortlisted</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="dashboard-card card text-white info">
                            <div class="card-body">
                                <div class="dashboard-stat">${stats.selected || 0}</div>
                                <div class="dashboard-label">Hired</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-lg-8">
                        <div class="card shadow-sm">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Recent Applications</h5>
                                <a href="#applications" class="btn btn-sm btn-primary">View All</a>
                            </div>
                            <div class="card-body">
                                ${data.recent_applications.length > 0 ? `
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Candidate</th>
                                                    <th>Job</th>
                                                    <th>Status</th>
                                                    <th>Applied Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${data.recent_applications.map(app => `
                                                    <tr>
                                                        <td>
                                                            <div>
                                                                <strong>${app.full_name}</strong><br>
                                                                <small class="text-muted">${app.email}</small>
                                                            </div>
                                                        </td>
                                                        <td>${app.job_title}</td>
                                                        <td><span class="badge status-${app.status}">${app.status}</span></td>
                                                        <td>${new Date(app.applied_at).toLocaleDateString()}</td>
                                                        <td>
                                                            <div class="btn-group btn-group-sm">
                                                                <button class="btn btn-outline-primary" onclick="app.viewApplication(${app.id})">View</button>
                                                                <button class="btn btn-outline-success" onclick="app.updateApplicationStatus(${app.id}, 'shortlisted')">Shortlist</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                ` : '<p class="text-muted">No applications yet</p>'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-4">
                        <div class="card shadow-sm mb-4">
                            <div class="card-header">
                                <h5 class="mb-0">Popular Jobs</h5>
                            </div>
                            <div class="card-body">
                                ${data.popular_jobs.length > 0 ? 
                                    data.popular_jobs.map(job => `
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <span>${job.title}</span>
                                            <span class="badge bg-primary">${job.application_count}</span>
                                        </div>
                                    `).join('') : 
                                    '<p class="text-muted">No job data available</p>'
                                }
                            </div>
                        </div>
                        
                        <div class="card shadow-sm">
                            <div class="card-header">
                                <h5 class="mb-0">Upcoming Interviews</h5>
                            </div>
                            <div class="card-body">
                                ${data.upcoming_interviews.length > 0 ? 
                                    data.upcoming_interviews.map(interview => `
                                        <div class="mb-3 p-3 border rounded">
                                            <h6>${interview.candidate_name}</h6>
                                            <p class="mb-1">${interview.job_title}</p>
                                            <p class="mb-0"><i class="fas fa-calendar"></i> ${new Date(interview.interview_date).toLocaleString()}</p>
                                        </div>
                                    `).join('') : 
                                    '<p class="text-muted">No upcoming interviews</p>'
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async handleLogin(form) {
        const formData = new FormData(form);
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('api/auth.php?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.success) {
                this.currentUser = result.user;
                this.updateNavigation();
                this.showToast('Login successful!', 'success');
                this.navigate('dashboard');
            } else {
                this.showToast(result.message, 'error');
            }
        } catch (error) {
            this.showToast('Login failed. Please try again.', 'error');
        }
    }

    async handleRegister(form) {
        const formData = new FormData(form);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm_password');

        if (password !== confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return;
        }

        const data = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: password,
            full_name: formData.get('full_name'),
            phone: formData.get('phone')
        };

        try {
            const response = await fetch('api/auth.php?action=register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showToast('Registration successful! Please login.', 'success');
                this.navigate('login');
            } else {
                this.showToast(result.message, 'error');
            }
        } catch (error) {
            this.showToast('Registration failed. Please try again.', 'error');
        }
    }

    async handleJobSearch(form) {
        const formData = new FormData(form);
        const params = new URLSearchParams();
        
        for (let [key, value] of formData.entries()) {
            if (value.trim()) {
                params.append(key, value);
            }
        }

        try {
            const response = await fetch(`api/jobs.php?action=search&${params}`);
            const data = await response.json();
            
            if (data.success) {
                const jobsList = document.getElementById('jobsList');
                if (data.jobs.length > 0) {
                    jobsList.innerHTML = data.jobs.map(job => `
                        <div class="card job-card mb-4 shadow-sm">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-8">
                                        <h5 class="card-title">${job.title}</h5>
                                        <p class="card-text">${job.description.substring(0, 200)}...</p>
                                        <div class="job-meta">
                                            <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                                            <span><i class="fas fa-clock"></i> ${job.job_type}</span>
                                            ${job.salary_range ? `<span><i class="fas fa-dollar-sign"></i> ${job.salary_range}</span>` : ''}
                                            <span><i class="fas fa-users"></i> ${job.application_count} applications</span>
                                        </div>
                                    </div>
                                    <div class="col-md-4 text-end">
                                        <div class="mb-2">
                                            <small class="text-muted">Posted ${new Date(job.created_at).toLocaleDateString()}</small>
                                        </div>
                                        <a href="#job/${job.id}" class="btn btn-primary">View Details</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('');
                } else {
                    jobsList.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><h3>No jobs found</h3><p>Try adjusting your search criteria.</p></div>';
                }
            }
        } catch (error) {
            this.showToast('Search failed. Please try again.', 'error');
        }
    }

    async checkIfApplied(jobId) {
        try {
            const response = await fetch('api/applications.php?action=my-applications');
            const data = await response.json();
            
            if (data.success) {
                return data.applications.some(app => app.job_id == jobId);
            }
        } catch (error) {
            console.error('Error checking application status:', error);
        }
        return false;
    }

    showApplyModal(jobId) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Apply for Job</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="applyForm">
                            <div class="mb-3">
                                <label for="coverLetter" class="form-label">Cover Letter</label>
                                <textarea class="form-control" id="coverLetter" rows="5" placeholder="Tell us why you're interested in this position..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="app.submitApplication(${jobId})">Submit Application</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            document.body.removeChild(modal);
        });
    }

    async submitApplication(jobId) {
        const coverLetter = document.getElementById('coverLetter').value;
        
        try {
            const response = await fetch('api/jobs.php?action=apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_id: jobId,
                    cover_letter: coverLetter
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showToast('Application submitted successfully!', 'success');
                bootstrap.Modal.getInstance(document.querySelector('.modal')).hide();
                // Refresh the page to show updated status
                setTimeout(() => location.reload(), 1000);
            } else {
                this.showToast(result.message, 'error');
            }
        } catch (error) {
            this.showToast('Failed to submit application. Please try again.', 'error');
        }
    }

    initializePageSpecificFeatures(route) {
        // Initialize tooltips and popovers
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        // Add smooth animations to new elements
        const newElements = document.querySelectorAll('.card, .btn');
        newElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            setTimeout(() => {
                el.style.transition = 'all 0.3s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('notificationToast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.className = `toast ${type === 'success' ? 'bg-success text-white' : type === 'error' ? 'bg-danger text-white' : 'bg-info text-white'}`;
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    async logout() {
        try {
            await fetch('api/auth.php?action=logout');
            this.currentUser = null;
            this.updateNavigation();
            this.showToast('Logged out successfully', 'success');
            this.navigate('home');
        } catch (error) {
            this.showToast('Logout failed', 'error');
        }
    }
}

// Global functions for onclick handlers
function logout() {
    app.logout();
}

// Initialize the application
const app = new RecruitWorXApp();