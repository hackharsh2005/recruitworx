-- Create database
CREATE DATABASE IF NOT EXISTS recruitworx_db;
USE recruitworx_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'hr', 'candidate') DEFAULT 'candidate',
    phone VARCHAR(20),
    address TEXT,
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    job_type ENUM('Full-time', 'Part-time', 'Contract', 'Internship') NOT NULL,
    salary_range VARCHAR(100),
    required_skills TEXT,
    deadline DATE,
    status ENUM('active', 'closed', 'draft') DEFAULT 'active',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    user_id INT NOT NULL,
    cover_letter TEXT,
    resume_path VARCHAR(255),
    status ENUM('applied', 'shortlisted', 'interviewed', 'selected', 'rejected') DEFAULT 'applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, user_id)
);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    interview_date DATETIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    notes TEXT,
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    feedback TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo VARCHAR(255),
    industry VARCHAR(100),
    size ENUM('1-10', '11-50', '51-200', '201-500', '500+'),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (username, email, password, full_name, role, phone) VALUES
('admin', 'admin@recruitworx.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin', '+1234567890'),
('hr_manager', 'hr@recruitworx.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'HR Manager', 'hr', '+1234567891'),
('john_doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', 'candidate', '+1234567892');

INSERT INTO companies (name, description, website, industry, size, location) VALUES
('RecruitWorX Inc.', 'Leading recruitment technology company', 'https://recruitworx.com', 'Technology', '51-200', 'San Francisco, CA'),
('TechCorp Solutions', 'Innovative software development company', 'https://techcorp.com', 'Software', '201-500', 'New York, NY');

INSERT INTO jobs (title, description, location, job_type, salary_range, required_skills, deadline, created_by) VALUES
('Senior Full Stack Developer', 'We are looking for an experienced Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies.', 'San Francisco, CA', 'Full-time', '$80,000 - $120,000', 'JavaScript, React, Node.js, PHP, MySQL, Git', '2025-03-01', 2),
('UI/UX Designer', 'Creative UI/UX Designer needed to design intuitive and engaging user interfaces for our web and mobile applications.', 'Remote', 'Full-time', '$60,000 - $90,000', 'Figma, Adobe Creative Suite, Prototyping, User Research', '2025-02-28', 2),
('Data Analyst', 'Join our data team to analyze business metrics and provide insights that drive strategic decisions.', 'New York, NY', 'Full-time', '$70,000 - $95,000', 'SQL, Python, Tableau, Excel, Statistics', '2025-03-15', 2),
('Marketing Intern', 'Exciting internship opportunity for marketing students to gain hands-on experience in digital marketing.', 'Los Angeles, CA', 'Internship', '$15 - $20/hour', 'Social Media, Content Creation, Analytics', '2025-02-20', 2);

INSERT INTO applications (job_id, user_id, cover_letter, status) VALUES
(1, 3, 'I am excited to apply for the Senior Full Stack Developer position. With 5 years of experience in web development, I have strong skills in JavaScript, React, and Node.js.', 'applied'),
(2, 3, 'As a passionate designer with 3 years of experience, I would love to contribute to your UI/UX team.', 'shortlisted');

INSERT INTO interviews (application_id, interview_date, location, notes, status) VALUES
(2, '2025-01-25 14:00:00', 'Video Call - Zoom Link: https://zoom.us/j/123456789', 'First round interview with design team', 'scheduled');