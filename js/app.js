// Enhanced RecruitWorX Application with Advanced Features
class RecruitWorXApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'home';
        this.notifications = [];
        this.filters = {
            search: '',
            location: '',
            job_type: '',
            salary_min: '',
            salary_max: '',
            skills: []
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthentication();
        this.handleRouting();
        this.initializeAnimations();
        this.loadNotifications();
        this.setupThemeToggle();
        this.initializeAdvancedFeatures();
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
            } else if (e.target.id === 'advancedSearchForm') {
                e.preventDefault();
                this.handleAdvancedSearch(e.target);
            }
        });

        // Real-time search
        document.addEventListener('input', (e) => {
            if (e.target.id === 'quickSearch') {
                this.debounce(() => this.handleQuickSearch(e.target.value), 300)();
            }
        });

        // Window events
        window.addEventListener('popstate', () => this.handleRouting());
        window.addEventListener('load', () => this.handleRouting());
        window.addEventListener('scroll', () => this.handleScroll());
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
        }, { threshold: 0.1 });

        // Observe all cards and sections
        document.querySelectorAll('.card, .hero-section, .stat-card').forEach(el => {
            observer.observe(el);
        });
    }

    initializeAdvancedFeatures() {
        // Initialize tooltips
        this.initializeTooltips();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Initialize drag and drop for file uploads
        this.initializeDragDrop();
        
        // Setup auto-save for forms
        this.setupAutoSave();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        this.focusSearch();
                        break;
                    case 'n':
                        e.preventDefault();
                        if (this.currentUser && ['admin', 'hr'].includes(this.currentUser.role)) {
                            this.openJobModal();
                        }
                        break;
                    case 'd':
                        e.preventDefault();
                        if (this.currentUser) {
                            this.navigate('dashboard');
                        }
                        break;
                }
            }
        });
    }

    focusSearch() {
        const searchInput = document.querySelector('#quickSearch, input[name="search"]');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async checkAuthentication() {
        try {
            const response = await fetch('api/auth.php?action=check');
            const data = await response.json();
            
            if (data.success && data.authenticated) {
                this.currentUser = data.user;
                this.updateNavigation();
                this.loadUserPreferences();
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
            
            // Add notification indicator
            this.updateNotificationIndicator();
        } else {
            authSection.classList.remove('d-none');
            userSection.classList.add('d-none');
        }
    }

    updateNotificationIndicator() {
        const existingDot = document.querySelector('.notification-dot');
        if (existingDot) existingDot.remove();

        if (this.notifications.length > 0) {
            const dashboardLink = document.querySelector('a[href="#/dashboard"]');
            if (dashboardLink) {
                const dot = document.createElement('span');
                dot.className = 'notification-dot';
                dashboardLink.style.position = 'relative';
                dashboardLink.appendChild(dot);
            }
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
        content.innerHTML = this.renderLoadingState();

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
                case 'profile':
                    html = await this.renderProfilePage();
                    break;
                case 'analytics':
                    html = await this.renderAnalyticsPage();
                    break;
                case 'settings':
                    html = await this.renderSettingsPage();
                    break;
                default:
                    if (route.startsWith('job/')) {
                        const jobId = route.split('/')[1];
                        html = await this.renderJobDetail(jobId);
                    } else {
                        html = this.render404Page();
                    }
            }

            content.innerHTML = html;
            this.initializePageSpecificFeatures(route);
            
        } catch (error) {
            console.error('Page render error:', error);
            content.innerHTML = this.renderErrorPage(error);
        }
    }

    renderLoadingState() {
        return `
            <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
                <div class="text-center">
                    <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="text-muted">Loading amazing content...</p>
                </div>
            </div>
        `;
    }

    render404Page() {
        return `
            <div class="container py-5">
                <div class="text-center">
                    <div class="mb-4">
                        <i class="fas fa-exclamation-triangle text-warning" style="font-size: 5rem;"></i>
                    </div>
                    <h1 class="display-4 mb-3">Page Not Found</h1>
                    <p class="lead mb-4">The page you're looking for doesn't exist.</p>
                    <a href="#home" class="btn btn-primary btn-lg">Go Home</a>
                </div>
            </div>
        `;
    }

    renderErrorPage(error) {
        return `
            <div class="container py-5">
                <div class="text-center">
                    <div class="mb-4">
                        <i class="fas fa-bug text-danger" style="font-size: 5rem;"></i>
                    </div>
                    <h1 class="display-4 mb-3">Oops! Something went wrong</h1>
                    <p class="lead mb-4">We're working to fix this issue. Please try again later.</p>
                    <button class="btn btn-primary btn-lg" onclick="location.reload()">Refresh Page</button>
                </div>
            </div>
        `;
    }

    async renderHomePage() {
        const jobsResponse = await fetch('api/jobs.php');
        const jobsData = await jobsResponse.json();
        const recentJobs = jobsData.success ? jobsData.jobs.slice(0, 6) : [];

        // Get statistics
        const stats = await this.getHomePageStats();

        return `
            <div class="hero-section">
                <div class="container">
                    <div class="row align-items-center">
                        <div class="col-lg-6">
                            <div class="hero-content">
                                <h1 class="display-4 fw-bold mb-4">Find Your Dream Job</h1>
                                <p class="lead mb-4">Connect with top employers and discover opportunities that match your skills and aspirations. Join thousands of professionals who found their perfect career match.</p>
                                <div class="d-flex gap-3 mb-4">
                                    <a href="#jobs" class="btn btn-light btn-lg px-4 hover-lift">
                                        <i class="fas fa-search me-2"></i>Browse Jobs
                                    </a>
                                    <a href="#register" class="btn btn-outline-light btn-lg px-4 hover-lift">
                                        <i class="fas fa-user-plus me-2"></i>Get Started
                                    </a>
                                </div>
                                <div class="row text-center">
                                    <div class="col-4">
                                        <div class="stat-number text-white">${stats.totalJobs}+</div>
                                        <div class="stat-label text-white-50">Active Jobs</div>
                                    </div>
                                    <div class="col-4">
                                        <div class="stat-number text-white">${stats.totalCompanies}+</div>
                                        <div class="stat-label text-white-50">Companies</div>
                                    </div>
                                    <div class="col-4">
                                        <div class="stat-number text-white">${stats.totalCandidates}+</div>
                                        <div class="stat-label text-white-50">Candidates</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6">
                            <div class="hero-image text-center">
                                <div class="position-relative">
                                    <i class="fas fa-briefcase text-white" style="font-size: 15rem; opacity: 0.1;"></i>
                                    <div class="position-absolute top-50 start-50 translate-middle">
                                        <div class="glass-effect p-4 rounded-3">
                                            <i class="fas fa-rocket text-white" style="font-size: 4rem;"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Search -->
            <div class="container py-4">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        <div class="advanced-search">
                            <div class="row">
                                <div class="col-md-5">
                                    <input type="text" id="quickSearch" class="form-control form-control-lg" placeholder="Search jobs, companies, or skills...">
                                </div>
                                <div class="col-md-4">
                                    <input type="text" class="form-control form-control-lg" placeholder="Location">
                                </div>
                                <div class="col-md-3">
                                    <button class="btn btn-primary btn-lg w-100" onclick="app.handleQuickSearch()">
                                        <i class="fas fa-search me-2"></i>Search
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Features Section -->
            <div class="container py-5">
                <div class="text-center mb-5">
                    <h2 class="display-5 fw-bold mb-3">Why Choose RecruitWorX?</h2>
                    <p class="lead text-muted">Discover the features that make us the preferred choice for job seekers and employers</p>
                </div>
                
                <div class="row">
                    <div class="col-lg-4 mb-4">
                        <div class="card h-100 text-center border-0 shadow-sm feature-highlight">
                            <div class="card-body p-4">
                                <div class="mb-3">
                                    <div class="bg-primary bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                                        <i class="fas fa-search text-white" style="font-size: 2rem;"></i>
                                    </div>
                                </div>
                                <h5 class="card-title fw-bold">Smart Job Search</h5>
                                <p class="card-text">Advanced AI-powered search algorithms help you find the perfect job that matches your skills, experience, and preferences.</p>
                                <div class="mt-3">
                                    <span class="badge bg-primary">AI Powered</span>
                                    <span class="badge bg-success">Real-time</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 mb-4">
                        <div class="card h-100 text-center border-0 shadow-sm feature-highlight">
                            <div class="card-body p-4">
                                <div class="mb-3">
                                    <div class="bg-success bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                                        <i class="fas fa-file-alt text-white" style="font-size: 2rem;"></i>
                                    </div>
                                </div>
                                <h5 class="card-title fw-bold">One-Click Apply</h5>
                                <p class="card-text">Submit applications instantly with our streamlined process. Track your progress and get real-time updates on your applications.</p>
                                <div class="mt-3">
                                    <span class="badge bg-info">Instant</span>
                                    <span class="badge bg-warning">Tracking</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 mb-4">
                        <div class="card h-100 text-center border-0 shadow-sm feature-highlight">
                            <div class="card-body p-4">
                                <div class="mb-3">
                                    <div class="bg-warning bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                                        <i class="fas fa-handshake text-white" style="font-size: 2rem;"></i>
                                    </div>
                                </div>
                                <h5 class="card-title fw-bold">Direct Connect</h5>
                                <p class="card-text">Connect directly with hiring managers and recruiters. Schedule interviews and get feedback through our integrated communication platform.</p>
                                <div class="mt-3">
                                    <span class="badge bg-danger">Direct</span>
                                    <span class="badge bg-primary">Integrated</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Latest Jobs Section -->
            <div class="container py-5">
                <div class="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 class="display-6 fw-bold mb-2">Latest Opportunities</h2>
                        <p class="text-muted">Fresh job postings from top companies</p>
                    </div>
                    <a href="#jobs" class="btn btn-outline-primary">View All Jobs</a>
                </div>
                
                <div class="row">
                    ${recentJobs.map((job, index) => `
                        <div class="col-lg-6 mb-4">
                            <div class="card job-card h-100 shadow-sm hover-lift" style="animation-delay: ${index * 0.1}s;">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start mb-3">
                                        <div class="company-logo bg-primary bg-gradient rounded d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                            <i class="fas fa-building text-white"></i>
                                        </div>
                                        <span class="badge bg-success">${job.job_type}</span>
                                    </div>
                                    <h5 class="card-title fw-bold mb-2">${job.title}</h5>
                                    <p class="card-text text-muted mb-3">${job.description.substring(0, 120)}...</p>
                                    <div class="job-meta mb-3">
                                        <div class="d-flex align-items-center mb-2">
                                            <i class="fas fa-map-marker-alt text-primary me-2"></i>
                                            <span>${job.location}</span>
                                        </div>
                                        ${job.salary_range ? `
                                            <div class="d-flex align-items-center mb-2">
                                                <i class="fas fa-dollar-sign text-success me-2"></i>
                                                <span>${job.salary_range}</span>
                                            </div>
                                        ` : ''}
                                        <div class="d-flex align-items-center">
                                            <i class="fas fa-users text-info me-2"></i>
                                            <span>${job.application_count} applicants</span>
                                        </div>
                                    </div>
                                    ${job.required_skills ? `
                                        <div class="mb-3">
                                            ${job.required_skills.split(',').slice(0, 3).map(skill => 
                                                `<span class="skill-tag">${skill.trim()}</span>`
                                            ).join('')}
                                        </div>
                                    ` : ''}
                                    <div class="d-flex justify-content-between align-items-center">
                                        <small class="text-muted">
                                            <i class="fas fa-clock me-1"></i>
                                            ${this.timeAgo(job.created_at)}
                                        </small>
                                        <a href="#job/${job.id}" class="btn btn-primary btn-sm">View Details</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Statistics Section -->
            <div class="container py-5">
                <div class="row">
                    <div class="col-md-3 mb-4">
                        <div class="stat-card">
                            <div class="stat-number">${stats.totalJobs}</div>
                            <div class="stat-label">Active Jobs</div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-4">
                        <div class="stat-card">
                            <div class="stat-number">${stats.totalApplications}</div>
                            <div class="stat-label">Applications</div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-4">
                        <div class="stat-card">
                            <div class="stat-number">${stats.totalCompanies}</div>
                            <div class="stat-label">Companies</div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-4">
                        <div class="stat-card">
                            <div class="stat-number">${stats.successRate}%</div>
                            <div class="stat-label">Success Rate</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async getHomePageStats() {
        // Mock statistics - in real app, fetch from API
        return {
            totalJobs: 1247,
            totalApplications: 8934,
            totalCompanies: 156,
            totalCandidates: 2341,
            successRate: 87
        };
    }

    timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    async renderJobsPage() {
        const response = await fetch('api/jobs.php');
        const data = await response.json();
        const jobs = data.success ? data.jobs : [];

        return `
            <div class="container py-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 class="fw-bold mb-2">Job Opportunities</h1>
                        <p class="text-muted mb-0">Discover your next career move</p>
                    </div>
                    ${this.currentUser && ['admin', 'hr'].includes(this.currentUser.role) ? 
                        '<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#jobModal" onclick="app.openJobModal()"><i class="fas fa-plus me-2"></i>Post New Job</button>' : ''}
                </div>

                <!-- Advanced Search -->
                <div class="advanced-search mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0"><i class="fas fa-filter me-2"></i>Search & Filter</h5>
                        <a href="#" class="search-toggle" onclick="app.toggleAdvancedSearch()">
                            <i class="fas fa-chevron-down me-1"></i>Advanced Options
                        </a>
                    </div>
                    
                    <form id="jobSearchForm">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <input type="text" class="form-control" name="search" placeholder="Job title, keywords, or company">
                            </div>
                            <div class="col-md-3 mb-3">
                                <input type="text" class="form-control" name="location" placeholder="City, state, or remote">
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
                                <button type="submit" class="btn btn-primary w-100">
                                    <i class="fas fa-search me-2"></i>Search
                                </button>
                            </div>
                        </div>
                        
                        <div id="advancedOptions" class="collapse">
                            <hr>
                            <div class="row">
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Salary Range</label>
                                    <div class="row">
                                        <div class="col-6">
                                            <input type="number" class="form-control" name="salary_min" placeholder="Min">
                                        </div>
                                        <div class="col-6">
                                            <input type="number" class="form-control" name="salary_max" placeholder="Max">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Experience Level</label>
                                    <select class="form-control" name="experience">
                                        <option value="">Any Level</option>
                                        <option value="entry">Entry Level</option>
                                        <option value="mid">Mid Level</option>
                                        <option value="senior">Senior Level</option>
                                        <option value="executive">Executive</option>
                                    </select>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Posted Date</label>
                                    <select class="form-control" name="posted_date">
                                        <option value="">Any Time</option>
                                        <option value="1">Last 24 hours</option>
                                        <option value="7">Last 7 days</option>
                                        <option value="30">Last 30 days</option>
                                    </select>
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label class="form-label">Company Size</label>
                                    <select class="form-control" name="company_size">
                                        <option value="">Any Size</option>
                                        <option value="startup">Startup (1-50)</option>
                                        <option value="medium">Medium (51-500)</option>
                                        <option value="large">Large (500+)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <!-- Filter Chips -->
                <div class="mb-4">
                    <div class="d-flex flex-wrap gap-2">
                        <span class="filter-chip" onclick="app.toggleFilter('remote')">
                            <i class="fas fa-home me-1"></i>Remote
                        </span>
                        <span class="filter-chip" onclick="app.toggleFilter('fulltime')">
                            <i class="fas fa-clock me-1"></i>Full-time
                        </span>
                        <span class="filter-chip" onclick="app.toggleFilter('tech')">
                            <i class="fas fa-code me-1"></i>Technology
                        </span>
                        <span class="filter-chip" onclick="app.toggleFilter('startup')">
                            <i class="fas fa-rocket me-1"></i>Startup
                        </span>
                        <span class="filter-chip" onclick="app.toggleFilter('senior')">
                            <i class="fas fa-star me-1"></i>Senior Level
                        </span>
                    </div>
                </div>

                <!-- Results Info -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <span class="text-muted">Showing ${jobs.length} jobs</span>
                    </div>
                    <div class="d-flex gap-2">
                        <select class="form-select form-select-sm" style="width: auto;" onchange="app.sortJobs(this.value)">
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="salary_high">Salary: High to Low</option>
                            <option value="salary_low">Salary: Low to High</option>
                            <option value="applications">Most Applications</option>
                        </select>
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-outline-secondary active" onclick="app.setViewMode('list')">
                                <i class="fas fa-list"></i>
                            </button>
                            <button type="button" class="btn btn-outline-secondary" onclick="app.setViewMode('grid')">
                                <i class="fas fa-th"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Jobs List -->
                <div id="jobsList">
                    ${jobs.length > 0 ? jobs.map((job, index) => `
                        <div class="card job-card mb-4 shadow-sm hover-lift" style="animation-delay: ${index * 0.05}s;">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-8">
                                        <div class="d-flex align-items-start mb-3">
                                            <div class="company-logo bg-primary bg-gradient rounded me-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px; min-width: 60px;">
                                                <i class="fas fa-building text-white"></i>
                                            </div>
                                            <div class="flex-grow-1">
                                                <h5 class="card-title fw-bold mb-1">${job.title}</h5>
                                                <p class="text-muted mb-2">${job.created_by_name || 'Company Name'}</p>
                                                <div class="d-flex flex-wrap gap-2 mb-2">
                                                    <span class="badge bg-primary">${job.job_type}</span>
                                                    <span class="badge bg-outline-secondary">
                                                        <i class="fas fa-map-marker-alt me-1"></i>${job.location}
                                                    </span>
                                                    ${job.salary_range ? `<span class="badge bg-success">${job.salary_range}</span>` : ''}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <p class="card-text mb-3">${job.description.substring(0, 200)}...</p>
                                        
                                        ${job.required_skills ? `
                                            <div class="mb-3">
                                                ${job.required_skills.split(',').slice(0, 5).map(skill => 
                                                    `<span class="skill-tag">${skill.trim()}</span>`
                                                ).join('')}
                                                ${job.required_skills.split(',').length > 5 ? '<span class="text-muted">+more</span>' : ''}
                                            </div>
                                        ` : ''}
                                        
                                        <div class="job-meta">
                                            <span><i class="fas fa-users text-info me-1"></i> ${job.application_count} applications</span>
                                            <span><i class="fas fa-clock text-muted me-1"></i> ${this.timeAgo(job.created_at)}</span>
                                        </div>
                                    </div>
                                    <div class="col-md-4 text-end">
                                        <div class="mb-3">
                                            <button class="btn btn-outline-primary btn-sm me-2" onclick="app.saveJob(${job.id})">
                                                <i class="fas fa-bookmark"></i>
                                            </button>
                                            <button class="btn btn-outline-secondary btn-sm" onclick="app.shareJob(${job.id})">
                                                <i class="fas fa-share"></i>
                                            </button>
                                        </div>
                                        <a href="#job/${job.id}" class="btn btn-primary mb-2 w-100">View Details</a>
                                        ${this.currentUser && ['admin', 'hr'].includes(this.currentUser.role) ? `
                                            <div class="btn-group w-100">
                                                <button class="btn btn-sm btn-outline-primary" onclick="app.editJob(${job.id})">Edit</button>
                                                <button class="btn btn-sm btn-outline-danger" onclick="app.deleteJob(${job.id})">Delete</button>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('') : this.renderEmptyState('briefcase', 'No jobs found', 'Try adjusting your search criteria or check back later for new opportunities.')}
                </div>

                <!-- Load More Button -->
                ${jobs.length >= 10 ? `
                    <div class="text-center mt-4">
                        <button class="btn btn-outline-primary btn-lg" onclick="app.loadMoreJobs()">
                            <i class="fas fa-plus me-2"></i>Load More Jobs
                        </button>
                    </div>
                ` : ''}
            </div>

            <!-- Floating Action Button for Quick Actions -->
            ${this.currentUser && ['admin', 'hr'].includes(this.currentUser.role) ? `
                <button class="fab" onclick="app.openJobModal()" title="Post New Job">
                    <i class="fas fa-plus"></i>
                </button>
            ` : ''}
        `;
    }

    renderEmptyState(icon, title, description) {
        return `
            <div class="empty-state">
                <i class="fas fa-${icon}"></i>
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
        `;
    }

    toggleAdvancedSearch() {
        const options = document.getElementById('advancedOptions');
        const toggle = document.querySelector('.search-toggle i');
        
        if (options.classList.contains('show')) {
            options.classList.remove('show');
            toggle.className = 'fas fa-chevron-down me-1';
        } else {
            options.classList.add('show');
            toggle.className = 'fas fa-chevron-up me-1';
        }
    }

    toggleFilter(filterType) {
        const chip = event.target.closest('.filter-chip');
        chip.classList.toggle('active');
        
        // Update filters and refresh results
        this.updateFilters();
    }

    updateFilters() {
        // Collect active filters and update job list
        const activeFilters = Array.from(document.querySelectorAll('.filter-chip.active'))
            .map(chip => chip.textContent.trim());
        
        // Apply filters to job list
        this.applyFilters(activeFilters);
    }

    async applyFilters(filters) {
        // Implementation for applying filters
        console.log('Applying filters:', filters);
    }

    sortJobs(sortBy) {
        // Implementation for sorting jobs
        console.log('Sorting by:', sortBy);
    }

    setViewMode(mode) {
        // Toggle between list and grid view
        const buttons = document.querySelectorAll('.btn-group button');
        buttons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        const jobsList = document.getElementById('jobsList');
        if (mode === 'grid') {
            jobsList.classList.add('row');
            jobsList.querySelectorAll('.job-card').forEach(card => {
                card.parentElement.className = 'col-lg-6 mb-4';
            });
        } else {
            jobsList.classList.remove('row');
            jobsList.querySelectorAll('.job-card').forEach(card => {
                card.parentElement.className = 'mb-4';
            });
        }
    }

    saveJob(jobId) {
        // Implementation for saving/bookmarking jobs
        this.showToast('Job saved to your bookmarks!', 'success');
    }

    shareJob(jobId) {
        // Implementation for sharing jobs
        if (navigator.share) {
            navigator.share({
                title: 'Check out this job opportunity',
                url: `${window.location.origin}#job/${jobId}`
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${window.location.origin}#job/${jobId}`);
            this.showToast('Job link copied to clipboard!', 'success');
        }
    }

    async loadMoreJobs() {
        // Implementation for loading more jobs with pagination
        const button = event.target;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
        button.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
            this.showToast('More jobs loaded!', 'success');
        }, 1000);
    }

    async handleQuickSearch(query) {
        if (!query || query.length < 2) return;
        
        // Implementation for real-time search
        console.log('Quick search:', query);
    }

    setupThemeToggle() {
        // Add theme toggle functionality
        const themeToggle = document.createElement('button');
        themeToggle.className = 'btn btn-outline-secondary btn-sm';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.onclick = this.toggleTheme.bind(this);
        
        // Add to navigation
        const navSection = document.getElementById('navUserSection') || document.getElementById('navAuthSection');
        if (navSection) {
            navSection.appendChild(themeToggle);
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        
        // Update theme toggle icon
        const themeToggle = document.querySelector('.btn i.fa-moon, .btn i.fa-sun');
        if (themeToggle) {
            themeToggle.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        // Save preference
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    loadUserPreferences() {
        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    }

    async loadNotifications() {
        // Mock notifications - in real app, fetch from API
        this.notifications = [
            { id: 1, message: 'New job matching your profile', type: 'info', read: false },
            { id: 2, message: 'Application status updated', type: 'success', read: false }
        ];
    }

    initializeTooltips() {
        // Initialize Bootstrap tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    initializeDragDrop() {
        // Add drag and drop functionality for file uploads
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });
    }

    handleFileUpload(file) {
        // Handle file upload (resume, etc.)
        console.log('File uploaded:', file.name);
        this.showToast(`File "${file.name}" uploaded successfully!`, 'success');
    }

    setupAutoSave() {
        // Auto-save form data
        let autoSaveTimeout;
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea, select')) {
                clearTimeout(autoSaveTimeout);
                autoSaveTimeout = setTimeout(() => {
                    this.autoSaveFormData(e.target.form);
                }, 2000);
            }
        });
    }

    autoSaveFormData(form) {
        if (!form) return;
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Save to localStorage
        localStorage.setItem(`autosave_${form.id}`, JSON.stringify(data));
        
        // Show subtle indication
        const indicator = document.createElement('small');
        indicator.className = 'text-muted';
        indicator.textContent = 'Draft saved';
        indicator.style.opacity = '0';
        indicator.style.transition = 'opacity 0.3s';
        
        form.appendChild(indicator);
        setTimeout(() => indicator.style.opacity = '1', 100);
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => form.removeChild(indicator), 300);
        }, 2000);
    }

    handleScroll() {
        // Handle scroll events for navbar transparency, etc.
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    }

    // Continue with existing methods...
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
                <nav aria-label="breadcrumb" class="mb-4">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="#home">Home</a></li>
                        <li class="breadcrumb-item"><a href="#jobs">Jobs</a></li>
                        <li class="breadcrumb-item active">${job.title}</li>
                    </ol>
                </nav>

                <div class="row">
                    <div class="col-lg-8">
                        <div class="card shadow-sm mb-4">
                            <div class="card-body p-4">
                                <div class="d-flex align-items-start mb-4">
                                    <div class="company-logo bg-primary bg-gradient rounded me-3 d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                                        <i class="fas fa-building text-white" style="font-size: 2rem;"></i>
                                    </div>
                                    <div class="flex-grow-1">
                                        <h1 class="card-title fw-bold mb-2">${job.title}</h1>
                                        <p class="text-muted mb-2 fs-5">${job.created_by_name || 'Company Name'}</p>
                                        <div class="d-flex flex-wrap gap-2">
                                            <span class="badge bg-primary fs-6">${job.job_type}</span>
                                            <span class="badge bg-outline-secondary fs-6">
                                                <i class="fas fa-map-marker-alt me-1"></i>${job.location}
                                            </span>
                                            ${job.salary_range ? `<span class="badge bg-success fs-6">${job.salary_range}</span>` : ''}
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="job-meta mb-4">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="d-flex align-items-center mb-2">
                                                <i class="fas fa-calendar text-primary me-2"></i>
                                                <span>Posted ${this.timeAgo(job.created_at)}</span>
                                            </div>
                                            <div class="d-flex align-items-center mb-2">
                                                <i class="fas fa-users text-info me-2"></i>
                                                <span>${job.application_count} applications</span>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            ${job.deadline ? `
                                                <div class="d-flex align-items-center mb-2">
                                                    <i class="fas fa-clock text-warning me-2"></i>
                                                    <span>Deadline: ${new Date(job.deadline).toLocaleDateString()}</span>
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                                
                                <h3 class="fw-bold mb-3">Job Description</h3>
                                <div class="mb-4" style="line-height: 1.8;">${job.description.replace(/\n/g, '<br>')}</div>
                                
                                ${job.required_skills ? `
                                    <h3 class="fw-bold mb-3">Required Skills</h3>
                                    <div class="mb-4">
                                        ${job.required_skills.split(',').map(skill => 
                                            `<span class="skill-tag">${skill.trim()}</span>`
                                        ).join('')}
                                    </div>
                                ` : ''}
                                
                                ${job.deadline ? `
                                    <div class="alert alert-info d-flex align-items-center">
                                        <i class="fas fa-exclamation-circle me-2"></i>
                                        <span>Application deadline: <strong>${new Date(job.deadline).toLocaleDateString()}</strong></span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Similar Jobs -->
                        <div class="card shadow-sm">
                            <div class="card-header">
                                <h5 class="mb-0">Similar Jobs</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <!-- Similar jobs would be loaded here -->
                                    <div class="col-12">
                                        <p class="text-muted">Loading similar opportunities...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-lg-4">
                        <div class="card shadow-sm sticky-top" style="top: 2rem;">
                            <div class="card-body">
                                <h5 class="fw-bold mb-3">Job Overview</h5>
                                
                                <div class="mb-4">
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-muted">Applications</span>
                                        <strong>${job.application_count}</strong>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-muted">Posted by</span>
                                        <strong>${job.created_by_name}</strong>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-muted">Job Type</span>
                                        <strong>${job.job_type}</strong>
                                    </div>
                                    ${job.salary_range ? `
                                        <div class="d-flex justify-content-between mb-2">
                                            <span class="text-muted">Salary</span>
                                            <strong>${job.salary_range}</strong>
                                        </div>
                                    ` : ''}
                                </div>
                                
                                ${this.currentUser && this.currentUser.role === 'candidate' ? `
                                    <div class="d-grid gap-2 mb-3">
                                        ${hasApplied ? 
                                            '<button class="btn btn-success btn-lg" disabled><i class="fas fa-check me-2"></i>Applied</button>' :
                                            '<button class="btn btn-primary btn-lg" onclick="app.showApplyModal(' + job.id + ')"><i class="fas fa-paper-plane me-2"></i>Apply Now</button>'
                                        }
                                        <button class="btn btn-outline-primary" onclick="app.saveJob(' + job.id + ')">
                                            <i class="fas fa-bookmark me-2"></i>Save Job
                                        </button>
                                        <button class="btn btn-outline-secondary" onclick="app.shareJob(' + job.id + ')">
                                            <i class="fas fa-share me-2"></i>Share Job
                                        </button>
                                    </div>
                                ` : ''}
                                
                                ${!this.currentUser ? `
                                    <div class="d-grid gap-2 mb-3">
                                        <a href="#login" class="btn btn-primary btn-lg">
                                            <i class="fas fa-sign-in-alt me-2"></i>Login to Apply
                                        </a>
                                        <a href="#register" class="btn btn-outline-primary">
                                            <i class="fas fa-user-plus me-2"></i>Create Account
                                        </a>
                                    </div>
                                ` : ''}

                                <hr>
                                
                                <h6 class="fw-bold mb-3">Share this job</h6>
                                <div class="d-flex gap-2">
                                    <button class="btn btn-outline-primary btn-sm" onclick="app.shareOnSocial('linkedin', ${job.id})">
                                        <i class="fab fa-linkedin"></i>
                                    </button>
                                    <button class="btn btn-outline-info btn-sm" onclick="app.shareOnSocial('twitter', ${job.id})">
                                        <i class="fab fa-twitter"></i>
                                    </button>
                                    <button class="btn btn-outline-success btn-sm" onclick="app.shareOnSocial('whatsapp', ${job.id})">
                                        <i class="fab fa-whatsapp"></i>
                                    </button>
                                    <button class="btn btn-outline-secondary btn-sm" onclick="app.copyJobLink(${job.id})">
                                        <i class="fas fa-link"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    shareOnSocial(platform, jobId) {
        const url = `${window.location.origin}#job/${jobId}`;
        const text = 'Check out this job opportunity!';
        
        let shareUrl = '';
        switch (platform) {
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }

    copyJobLink(jobId) {
        const url = `${window.location.origin}#job/${jobId}`;
        navigator.clipboard.writeText(url).then(() => {
            this.showToast('Job link copied to clipboard!', 'success');
        });
    }

    // Continue with other existing methods...
    renderLoginPage() {
        return `
            <div class="container py-5">
                <div class="row justify-content-center">
                    <div class="col-md-6 col-lg-4">
                        <div class="card auth-card shadow-lg">
                            <div class="card-body p-5">
                                <div class="text-center mb-4">
                                    <div class="bg-primary bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
                                        <i class="fas fa-user text-white" style="font-size: 2rem;"></i>
                                    </div>
                                    <h2 class="fw-bold">Welcome Back</h2>
                                    <p class="text-muted">Sign in to your account</p>
                                </div>
                                
                                <form id="loginForm">
                                    <div class="mb-3">
                                        <label for="loginUsername" class="form-label">Username or Email</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="fas fa-user"></i></span>
                                            <input type="text" class="form-control" id="loginUsername" name="username" required>
                                        </div>
                                    </div>
                                    <div class="mb-4">
                                        <label for="loginPassword" class="form-label">Password</label>
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                            <input type="password" class="form-control" id="loginPassword" name="password" required>
                                            <button class="btn btn-outline-secondary" type="button" onclick="app.togglePassword('loginPassword')">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div class="d-flex justify-content-between align-items-center mb-4">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="rememberMe">
                                            <label class="form-check-label" for="rememberMe">Remember me</label>
                                        </div>
                                        <a href="#forgot-password" class="text-decoration-none">Forgot password?</a>
                                    </div>
                                    
                                    <button type="submit" class="btn btn-primary w-100 btn-lg mb-3">
                                        <i class="fas fa-sign-in-alt me-2"></i>Sign In
                                    </button>
                                </form>
                                
                                <div class="text-center">
                                    <p class="mb-3">Don't have an account? <a href="#register" class="text-decoration-none fw-bold">Create one</a></p>
                                </div>
                                
                                <hr class="my-4">
                                
                                <div class="text-center">
                                    <small class="text-muted">
                                        <strong>Demo Accounts:</strong><br>
                                        <div class="row mt-2">
                                            <div class="col-12 mb-1">
                                                <span class="badge bg-danger me-1">Admin</span>
                                                <code>admin / password</code>
                                            </div>
                                            <div class="col-12 mb-1">
                                                <span class="badge bg-warning me-1">HR</span>
                                                <code>hr_manager / password</code>
                                            </div>
                                            <div class="col-12">
                                                <span class="badge bg-info me-1">User</span>
                                                <code>john_doe / password</code>
                                            </div>
                                        </div>
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const icon = event.target.querySelector('i') || event.target;
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    renderRegisterPage() {
        return `
            <div class="container py-5">
                <div class="row justify-content-center">
                    <div class="col-md-8 col-lg-6">
                        <div class="card auth-card shadow-lg">
                            <div class="card-body p-5">
                                <div class="text-center mb-4">
                                    <div class="bg-success bg-gradient rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style="width: 80px; height: 80px;">
                                        <i class="fas fa-user-plus text-white" style="font-size: 2rem;"></i>
                                    </div>
                                    <h2 class="fw-bold">Create Account</h2>
                                    <p class="text-muted">Join thousands of professionals</p>
                                </div>
                                
                                <form id="registerForm">
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="regFullName" class="form-label">Full Name *</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-user"></i></span>
                                                <input type="text" class="form-control" id="regFullName" name="full_name" required>
                                            </div>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="regUsername" class="form-label">Username *</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-at"></i></span>
                                                <input type="text" class="form-control" id="regUsername" name="username" required>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="regEmail" class="form-label">Email Address *</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                                                <input type="email" class="form-control" id="regEmail" name="email" required>
                                            </div>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="regPhone" class="form-label">Phone Number</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-phone"></i></span>
                                                <input type="tel" class="form-control" id="regPhone" name="phone">
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label for="regPassword" class="form-label">Password *</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                                <input type="password" class="form-control" id="regPassword" name="password" required>
                                                <button class="btn btn-outline-secondary" type="button" onclick="app.togglePassword('regPassword')">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                            </div>
                                            <div class="form-text">
                                                <small>Password must be at least 8 characters long</small>
                                            </div>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <label for="regConfirmPassword" class="form-label">Confirm Password *</label>
                                            <div class="input-group">
                                                <span class="input-group-text"><i class="fas fa-lock"></i></span>
                                                <input type="password" class="form-control" id="regConfirmPassword" name="confirm_password" required>
                                                <button class="btn btn-outline-secondary" type="button" onclick="app.togglePassword('regConfirmPassword')">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="mb-4">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="agreeTerms" required>
                                            <label class="form-check-label" for="agreeTerms">
                                                I agree to the <a href="#terms" class="text-decoration-none">Terms of Service</a> and <a href="#privacy" class="text-decoration-none">Privacy Policy</a>
                                            </label>
                                        </div>
                                    </div>
                                    
                                    <button type="submit" class="btn btn-success w-100 btn-lg mb-3">
                                        <i class="fas fa-user-plus me-2"></i>Create Account
                                    </button>
                                </form>
                                
                                <div class="text-center">
                                    <p class="mb-0">Already have an account? <a href="#login" class="text-decoration-none fw-bold">Sign in</a></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Add remaining methods from original implementation...
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
                this.showToast('Welcome back! Login successful.', 'success');
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

        if (password.length < 8) {
            this.showToast('Password must be at least 8 characters long', 'error');
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
                this.showToast('Registration successful! Please login with your credentials.', 'success');
                this.navigate('login');
            } else {
                this.showToast(result.message, 'error');
            }
        } catch (error) {
            this.showToast('Registration failed. Please try again.', 'error');
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
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-paper-plane me-2"></i>Apply for Position
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            Your profile information will be automatically included with this application.
                        </div>
                        <form id="applyForm">
                            <div class="mb-3">
                                <label for="coverLetter" class="form-label">Cover Letter</label>
                                <textarea class="form-control" id="coverLetter" rows="8" placeholder="Dear Hiring Manager,

I am writing to express my interest in this position. I believe my skills and experience make me a strong candidate because...

Please find my qualifications below:
• [Your key qualification 1]
• [Your key qualification 2]
• [Your key qualification 3]

I would welcome the opportunity to discuss how I can contribute to your team.

Best regards,
${this.currentUser?.full_name || 'Your Name'}"></textarea>
                                <div class="form-text">
                                    <small>Tip: Customize your cover letter to highlight relevant experience and skills for this specific role.</small>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="resumeUpload" class="form-label">Resume/CV (Optional)</label>
                                <input type="file" class="form-control" id="resumeUpload" accept=".pdf,.doc,.docx">
                                <div class="form-text">
                                    <small>Supported formats: PDF, DOC, DOCX (Max 5MB)</small>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="fas fa-times me-2"></i>Cancel
                        </button>
                        <button type="button" class="btn btn-primary" onclick="app.submitApplication(${jobId})">
                            <i class="fas fa-paper-plane me-2"></i>Submit Application
                        </button>
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
        const submitButton = event.target;
        const originalText = submitButton.innerHTML;
        
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
        submitButton.disabled = true;
        
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
                this.showToast('Application submitted successfully! You will receive updates via email.', 'success');
                bootstrap.Modal.getInstance(document.querySelector('.modal')).hide();
                // Refresh the page to show updated status
                setTimeout(() => location.reload(), 1000);
            } else {
                this.showToast(result.message, 'error');
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        } catch (error) {
            this.showToast('Failed to submit application. Please try again.', 'error');
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }

    initializePageSpecificFeatures(route) {
        // Initialize tooltips and popovers
        this.initializeTooltips();

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

        // Initialize page-specific features
        if (route === 'jobs') {
            this.initializeJobsPageFeatures();
        } else if (route.startsWith('job/')) {
            this.initializeJobDetailFeatures();
        }
    }

    initializeJobsPageFeatures() {
        // Add keyboard navigation for job cards
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                const jobCards = document.querySelectorAll('.job-card');
                const currentFocus = document.activeElement;
                const currentIndex = Array.from(jobCards).indexOf(currentFocus.closest('.job-card'));
                
                let nextIndex;
                if (e.key === 'ArrowDown') {
                    nextIndex = currentIndex < jobCards.length - 1 ? currentIndex + 1 : 0;
                } else {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : jobCards.length - 1;
                }
                
                if (jobCards[nextIndex]) {
                    jobCards[nextIndex].focus();
                    jobCards[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }

    initializeJobDetailFeatures() {
        // Add reading progress indicator
        const progressBar = document.createElement('div');
        progressBar.className = 'progress position-fixed top-0 start-0 w-100';
        progressBar.style.height = '3px';
        progressBar.style.zIndex = '9999';
        progressBar.innerHTML = '<div class="progress-bar" role="progressbar"></div>';
        document.body.appendChild(progressBar);

        const updateProgress = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.querySelector('.progress-bar').style.width = scrollPercent + '%';
        };

        window.addEventListener('scroll', updateProgress);
        updateProgress();
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('notificationToast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        
        // Remove existing classes
        toast.classList.remove('bg-success', 'bg-danger', 'bg-info', 'bg-warning', 'text-white');
        
        // Add appropriate class based on type
        switch (type) {
            case 'success':
                toast.classList.add('bg-success', 'text-white');
                break;
            case 'error':
                toast.classList.add('bg-danger', 'text-white');
                break;
            case 'warning':
                toast.classList.add('bg-warning', 'text-white');
                break;
            default:
                toast.classList.add('bg-info', 'text-white');
        }
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    async logout() {
        try {
            await fetch('api/auth.php?action=logout');
            this.currentUser = null;
            this.updateNavigation();
            this.showToast('Logged out successfully. See you soon!', 'success');
            this.navigate('home');
        } catch (error) {
            this.showToast('Logout failed', 'error');
        }
    }

    // Placeholder methods for dashboard and other pages
    async renderDashboard() {
        if (!this.currentUser) {
            this.navigate('login');
            return '';
        }

        return `
            <div class="container py-4">
                <h1>Dashboard</h1>
                <p>Dashboard content will be implemented here...</p>
            </div>
        `;
    }

    async renderApplicationsPage() {
        return `
            <div class="container py-4">
                <h1>Applications</h1>
                <p>Applications page will be implemented here...</p>
            </div>
        `;
    }

    async renderInterviewsPage() {
        return `
            <div class="container py-4">
                <h1>Interviews</h1>
                <p>Interviews page will be implemented here...</p>
            </div>
        `;
    }

    async renderProfilePage() {
        return `
            <div class="container py-4">
                <h1>Profile</h1>
                <p>Profile page will be implemented here...</p>
            </div>
        `;
    }

    async renderAnalyticsPage() {
        return `
            <div class="container py-4">
                <h1>Analytics</h1>
                <p>Analytics page will be implemented here...</p>
            </div>
        `;
    }

    async renderSettingsPage() {
        return `
            <div class="container py-4">
                <h1>Settings</h1>
                <p>Settings page will be implemented here...</p>
            </div>
        `;
    }
}

// Global functions for onclick handlers
function logout() {
    app.logout();
}

// Initialize the application
const app = new RecruitWorXApp();