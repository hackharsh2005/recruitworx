# RecruitWorX - Beautiful Recruitment Management System

A stunning, full-featured recruitment management system built with modern web technologies.

## Features

### 🎨 Beautiful Design
- Modern, responsive UI with smooth animations
- Professional color scheme and typography
- Mobile-first design approach
- Intuitive user experience

### 👥 Multi-Role System
- **Candidates**: Browse jobs, apply, track applications
- **HR Managers**: Post jobs, manage applications, schedule interviews
- **Administrators**: Full system access and management

### 💼 Job Management
- Create and edit job postings
- Advanced job search and filtering
- Application tracking and management
- Interview scheduling system

### 📊 Dashboard & Analytics
- Role-based dashboards
- Application statistics
- Interview management
- Real-time updates

### 🔐 Security Features
- Secure authentication system
- Role-based access control
- Password hashing
- Session management

## Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with custom properties
- **JavaScript (ES6+)** - Interactive functionality
- **Bootstrap 5** - Responsive framework
- **Font Awesome** - Beautiful icons

### Backend
- **PHP 7.4+** - Server-side logic
- **MySQL 8.0+** - Database management
- **PDO** - Database abstraction layer
- **RESTful API** - Clean API architecture

## Installation

### Prerequisites
- PHP 7.4 or higher
- MySQL 8.0 or higher
- Web server (Apache/Nginx)
- Modern web browser

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/recruitworx.git
   cd recruitworx
   ```

2. **Database Setup**
   - Create a MySQL database named `recruitworx_db`
   - Import the SQL file: `mysql -u root -p recruitworx_db < config/init.sql`
   - Update database credentials in `config/database.php`

3. **Web Server Configuration**
   - Point your web server document root to the project directory
   - Ensure PHP has write permissions for session handling
   - Enable URL rewriting if needed

4. **Access the Application**
   - Open your browser and navigate to your local server
   - Use the demo accounts to explore features

## Demo Accounts

### Administrator
- **Username**: admin
- **Password**: password
- **Access**: Full system management

### HR Manager
- **Username**: hr_manager
- **Password**: password
- **Access**: Job and application management

### Candidate
- **Username**: john_doe
- **Password**: password
- **Access**: Job browsing and applications

## API Endpoints

### Authentication
- `POST /api/auth.php?action=login` - User login
- `POST /api/auth.php?action=register` - User registration
- `GET /api/auth.php?action=logout` - User logout
- `GET /api/auth.php?action=check` - Check authentication status

### Jobs
- `GET /api/jobs.php` - Get all jobs
- `GET /api/jobs.php?id={id}` - Get specific job
- `GET /api/jobs.php?action=search` - Search jobs
- `POST /api/jobs.php` - Create new job (HR/Admin only)
- `PUT /api/jobs.php` - Update job (HR/Admin only)
- `DELETE /api/jobs.php?id={id}` - Delete job (HR/Admin only)
- `POST /api/jobs.php?action=apply` - Apply to job

### Applications
- `GET /api/applications.php` - Get all applications (HR/Admin)
- `GET /api/applications.php?action=my-applications` - Get user's applications
- `PUT /api/applications.php` - Update application status (HR/Admin)

### Interviews
- `GET /api/interviews.php` - Get interviews
- `POST /api/interviews.php` - Schedule interview (HR/Admin)
- `PUT /api/interviews.php` - Update interview (HR/Admin)

### Dashboard
- `GET /api/dashboard.php` - Get dashboard data

## File Structure

```
recruitworx/
├── api/                    # API endpoints
│   ├── auth.php           # Authentication API
│   ├── jobs.php           # Jobs API
│   ├── applications.php   # Applications API
│   ├── interviews.php     # Interviews API
│   └── dashboard.php      # Dashboard API
├── config/                # Configuration files
│   ├── database.php       # Database connection
│   └── init.sql          # Database schema and sample data
├── js/                    # JavaScript files
│   └── app.js            # Main application logic
├── index.html            # Main HTML file
├── style.css             # Custom styles
└── README.md             # This file
```

## Features in Detail

### User Management
- Secure registration and login system
- Role-based access control (Admin, HR, Candidate)
- Profile management
- Session handling

### Job Management
- Create detailed job postings
- Rich text descriptions
- Skill requirements
- Application deadlines
- Job status management

### Application Process
- One-click job applications
- Cover letter submission
- Application status tracking
- Duplicate application prevention

### Interview System
- Schedule interviews with candidates
- Interview location/meeting links
- Interview notes and feedback
- Rating system

### Dashboard Analytics
- Application statistics
- Job performance metrics
- Interview scheduling
- Recent activity feeds

## Customization

### Styling
- Modify CSS custom properties in `style.css`
- Update color schemes and typography
- Add custom animations and transitions

### Functionality
- Extend API endpoints in the `api/` directory
- Add new features to the JavaScript application
- Customize database schema as needed

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Email: support@recruitworx.com

---

**RecruitWorX** - Connecting talent with opportunity through beautiful, modern technology.