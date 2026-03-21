# 🎓 Campus Placement Management System - Project Introduction

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Purpose and Objectives](#purpose-and-objectives)
3. [Key Features](#key-features)
4. [System Architecture](#system-architecture)
5. [Technology Stack](#technology-stack)
6. [User Roles and Permissions](#user-roles-and-permissions)
7. [Core Modules](#core-modules)
8. [Installation and Setup](#installation-and-setup)
9. [Project Structure](#project-structure)
10. [API Documentation](#api-documentation)
11. [Security Features](#security-features)
12. [Future Enhancements](#future-enhancements)

---

## 🎯 Project Overview

The **Campus Placement Management System** is a comprehensive, web-based platform designed to streamline and automate the entire campus recruitment process for educational institutions. Built with modern web technologies, this system serves as a centralized hub connecting students, administrators, and recruiters, facilitating efficient job postings, applications, and placement management.

### Vision Statement
> "Transforming spreadsheet chaos into streamlined success - A plug-and-play placement portal for every college."

This system addresses the common challenges faced by educational institutions in managing campus placements, replacing manual processes and spreadsheets with an automated, user-friendly digital solution.

---

## 🎯 Purpose and Objectives

### Primary Goals
1. **Digitalize Placement Process**: Eliminate paper-based and spreadsheet-driven placement management
2. **Enhance Student Experience**: Provide students with easy access to job opportunities and application tracking
3. **Streamline Admin Operations**: Enable administrators to efficiently manage jobs, students, and applications
4. **Data-Driven Insights**: Provide comprehensive analytics for better placement decision-making
5. **Scalability**: Support multiple courses, branches, and large student populations

### Key Objectives
- ✅ Centralized job posting and management system
- ✅ Automated student-job matching based on eligibility criteria
- ✅ Real-time application tracking and status updates
- ✅ Comprehensive analytics and reporting dashboard
- ✅ Secure role-based access control
- ✅ Email notifications and communication system
- ✅ Practice question bank for student preparation
- ✅ Interview experience sharing platform

---

## ✨ Key Features

### 👨‍💼 Admin Control Center

#### Job Management
- **Create & Manage Job Postings**: Post detailed job listings with company information, requirements, and deadlines
- **Company Branding**: Upload company logos and job description files
- **Eligibility Criteria**: Set filters for courses, branches, years, and CGPA requirements
- **Bulk Operations**: Manage multiple job postings efficiently
- **Status Tracking**: Monitor active, expired, and draft job postings

#### User Management
- **Student Approvals**: Review and approve student registrations
- **User Administration**: Manage users (students, faculty, admins) with role-based access
- **Account Activation/Deactivation**: Control user access to the system
- **Role Management**: Assign and manage admin and super admin roles

#### Application Management
- **View All Applications**: Monitor all student applications in one place
- **Status Updates**: Update application statuses (pending, shortlisted, selected, rejected)
- **Filtering & Search**: Find applications by student, job, status, or date
- **Export Functionality**: Export application data for reporting

#### Analytics Dashboard (Super Admin Only)
- **Overview Statistics**: Total students, jobs, applications, and placement rates
- **Application Analytics**: Status distribution, course-wise applications, monthly trends
- **Job Analytics**: Job posting trends, top companies, package distribution
- **Student Analytics**: Top performers, success rates, placement statistics
- **Visual Charts**: Interactive charts and graphs for data visualization
- **Export Reports**: Download analytics data in JSON format

#### Practice Questions Management
- **Question Bank**: Create and manage practice questions for different courses
- **Course Management**: Organize questions by course (MSc.CS, MSc.AIML, MCA, BSc.CS)
- **Question Types**: Support multiple question formats
- **Student Practice Module**: Enable students to practice and prepare for interviews

#### Interview Experiences
- **Content Moderation**: Review and approve student-submitted interview experiences
- **Company-wise Organization**: Organize experiences by company and role

### 👨‍🎓 Student Portal

#### Dashboard
- **Personalized Overview**: View eligible jobs, application status, and upcoming drives
- **Quick Statistics**: See total applications, selected jobs, and pending applications
- **Recent Activity**: Track latest job postings and application updates

#### Job Browsing & Applications
- **Eligible Jobs Display**: See only jobs matching student's course, branch, and year
- **One-Click Application**: Apply to jobs directly from the dashboard
- **Application Tracking**: Monitor status of all submitted applications
- **Job Details**: View comprehensive job information including requirements and deadlines

#### Profile Management
- **Personal Information**: Update name, email, contact details
- **Academic Details**: Manage course, branch, year, CGPA
- **Resume Upload**: Upload and manage resume files
- **Profile Completion**: Track profile completion status

#### Calendar Integration
- **Upcoming Drives**: View scheduled placement drives and interviews in calendar format
- **Event Management**: Track important dates and deadlines
- **FullCalendar Integration**: Interactive calendar interface

#### Practice Module
- **Course Selection**: Choose from available practice courses
- **Quiz System**: Take practice quizzes with multiple-choice questions
- **Results Tracking**: View quiz results and performance metrics
- **Preparation Support**: Access question bank for interview preparation

#### Interview Experiences
- **Share Experiences**: Submit interview experiences for other students
- **Browse Experiences**: Read experiences shared by peers
- **Company Insights**: Learn about interview processes at different companies

### 🔐 Authentication & Security

#### User Authentication
- **JWT-based Authentication**: Secure token-based authentication system
- **Role-Based Access Control**: Different access levels for students, admins, and super admins
- **Password Security**: Bcrypt hashing for password storage
- **Account Status Control**: Deactivated users cannot access the system
- **Session Management**: Secure session handling with token expiration

#### Access Control
- **Super Admin**: Full system access including analytics
- **Admin**: Manage jobs, students, applications (excluding analytics and other admins)
- **Student**: Access to personal dashboard, job applications, and profile
- **Faculty**: (Future implementation)

---

## 🏗️ System Architecture

### Architecture Pattern
The system follows a **3-tier architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                   │
│              (React.js Frontend - Port 5173)            │
│  - User Interface Components                            │
│  - State Management                                     │
│  - Routing & Navigation                                 │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/REST API
┌──────────────────▼──────────────────────────────────────┐
│                  Application Layer                      │
│          (Node.js + Express.js - Port 3000)             │
│  - RESTful API Endpoints                                │
│  - Business Logic                                       │
│  - Authentication & Authorization                       │
│  - File Upload Handling                                 │
└──────────────────┬──────────────────────────────────────┘
                   │ MongoDB Driver
┌──────────────────▼──────────────────────────────────────┐
│                    Data Layer                            │
│              (MongoDB Atlas - Cloud)                    │
│  - User Data                                            │
│  - Job Postings                                         │
│  - Applications                                         │
│  - Analytics Data                                       │
└─────────────────────────────────────────────────────────┘
```

### Data Flow
1. **User Request** → Frontend (React)
2. **API Call** → Backend (Express.js)
3. **Authentication Check** → JWT Middleware
4. **Business Logic** → Controllers
5. **Data Operations** → MongoDB via Mongoose
6. **Response** → JSON Data to Frontend
7. **UI Update** → React Components Re-render

---

## 🛠️ Technology Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **React.js** | 19.1.1 | UI framework for building interactive components |
| **React Router DOM** | 7.6.2 | Client-side routing and navigation |
| **Tailwind CSS** | 4.1.12 | Utility-first CSS framework for styling |
| **Vite** | 6.3.5 | Fast build tool and development server |
| **Axios** | 1.11.0 | HTTP client for API requests |
| **Recharts** | 3.1.2 | Chart library for analytics visualization |
| **FullCalendar** | 6.1.19 | Calendar component for event management |
| **React Hot Toast** | 2.6.0 | Toast notification system |
| **Lucide React** | 0.514.0 | Icon library |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | >=18.0.0 | JavaScript runtime environment |
| **Express.js** | 5.1.0 | Web application framework |
| **MongoDB** | - | NoSQL database |
| **Mongoose** | 8.18.0 | MongoDB object modeling |
| **JWT (jsonwebtoken)** | 9.0.2 | Authentication token generation |
| **Bcrypt** | 6.0.0 | Password hashing |
| **Multer** | 2.0.1 | File upload handling |
| **Nodemailer** | 7.0.5 | Email service integration |
| **Zod** | 4.0.17 | Schema validation |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **ExcelJS** | 4.4.0 | Excel file generation |

### Development Tools
- **Git**: Version control
- **MongoDB Atlas**: Cloud database hosting
- **Postman/Thunder Client**: API testing
- **VS Code**: Code editor

---

## 👥 User Roles and Permissions

### 1. Super Admin
**Full System Access**
- ✅ Access to Analytics Dashboard
- ✅ Manage all users (students, faculty, admins)
- ✅ Create and manage admin accounts
- ✅ All admin privileges
- ✅ System configuration

**Restrictions**: None

### 2. Admin
**Placement Management Access**
- ✅ Job posting and management
- ✅ Application management
- ✅ Student approvals
- ✅ User management (students and faculty only)
- ✅ Practice questions management
- ✅ Interview experiences moderation

**Restrictions**:
- ❌ Cannot access Analytics Dashboard
- ❌ Cannot manage other admin accounts
- ❌ Cannot manage super admin accounts

### 3. Student
**Personal Portal Access**
- ✅ View eligible job postings
- ✅ Apply to jobs
- ✅ Track application status
- ✅ Manage personal profile
- ✅ Upload resume
- ✅ Access practice questions
- ✅ Submit interview experiences
- ✅ View calendar events

**Restrictions**:
- ❌ Cannot access admin features
- ❌ Cannot view other students' data
- ❌ Cannot modify job postings

### 4. Faculty (Future Implementation)
**Limited Administrative Access**
- ✅ View student applications
- ✅ Provide recommendations
- ✅ Access to specific reports

---

## 📦 Core Modules

### 1. Authentication Module
- User registration and login
- JWT token generation and validation
- Password reset functionality
- Account activation/deactivation
- Role-based access control

### 2. Job Management Module
- Job posting creation and editing
- Company information management
- Eligibility criteria configuration
- Job status tracking
- File uploads (logos, job descriptions)

### 3. Application Module
- Application submission
- Application status tracking
- Application filtering and search
- Application export functionality
- Status update workflow

### 4. Student Management Module
- Student registration and approval
- Profile management
- Academic information tracking
- Resume management
- Student eligibility checking

### 5. Analytics Module
- Real-time statistics
- Application analytics
- Job analytics
- Student performance metrics
- Visual data representation
- Report generation

### 6. User Management Module
- User CRUD operations
- Role assignment
- Account status management
- User filtering and search
- Bulk operations

### 7. Practice Questions Module
- Question bank management
- Course-wise organization
- Quiz system
- Results tracking
- Performance analytics

### 8. Interview Experience Module
- Experience submission
- Content moderation
- Company-wise organization
- Search and filtering

### 9. Notification Module
- Email notifications
- Dashboard alerts
- Application status updates
- Job posting notifications

---

## 🚀 Installation and Setup

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **MongoDB Atlas**: Cloud database account (or local MongoDB)
- **Git**: Version control system
- **Code Editor**: VS Code recommended

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd Rollwala-placement
```

### Step 2: Backend Setup

```bash
cd backend
npm install
```

**Environment Variables** (Create `.env` file):
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

**Start Backend Server**:
```bash
npm start
# Server runs on http://localhost:3000
```

**Create Super Admin** (First time setup):
```bash
npm run create-super-admin
```

### Step 3: Frontend Setup

```bash
cd frontend
npm install
```

**Environment Variables** (Create `.env` file):
```env
VITE_API_URL=http://localhost:3000
```

**Start Frontend Development Server**:
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

### Step 4: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Admin Login**: http://localhost:5173/admin-login
- **Student Login**: http://localhost:5173/student-login

---

## 📁 Project Structure

```
Rollwala-placement/
│
├── backend/                    # Backend Node.js application
│   ├── config/                 # Configuration files
│   │   ├── api.js             # API endpoint configuration
│   │   └── db.js              # Database connection
│   ├── controllers/           # Business logic controllers
│   │   ├── adminController.js
│   │   ├── analyticsController.js
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   ├── jobControllers.js
│   │   └── studentController.js
│   ├── middleware/            # Custom middleware
│   │   └── auth.js           # Authentication middleware
│   ├── models/                # Mongoose data models
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   └── ...
│   ├── routes/                # API route definitions
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── jobRoutes.js
│   │   └── ...
│   ├── services/              # External services
│   │   └── emailService.js   # Email service integration
│   ├── scripts/              # Utility scripts
│   │   ├── createSuperAdmin.js
│   │   └── ...
│   ├── uploads/              # File uploads directory
│   ├── server.js             # Main server file
│   └── package.json          # Backend dependencies
│
├── frontend/                  # Frontend React application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── AdminAnalytics.jsx
│   │   │   ├── AdminJobPosting.jsx
│   │   │   ├── AdminManagement.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── ...
│   │   ├── api/              # API service functions
│   │   │   ├── auth.js
│   │   │   ├── jobs.js
│   │   │   └── ...
│   │   ├── config/           # Configuration
│   │   │   └── api.js
│   │   ├── lib/              # Utility libraries
│   │   ├── assets/           # Images and static files
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   └── package.json          # Frontend dependencies
│
└── README.md                  # Project documentation
```

---

## 🔌 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-otp` - Verify OTP for password reset
- `POST /api/auth/reset-password` - Reset password

### Job Endpoints
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job (Admin)
- `PUT /api/jobs/:id` - Update job (Admin)
- `DELETE /api/jobs/:id` - Delete job (Admin)

### Application Endpoints
- `GET /api/applications` - Get all applications
- `GET /api/applications/:id` - Get application by ID
- `POST /api/applications` - Submit application (Student)
- `PUT /api/applications/:id` - Update application status (Admin)
- `GET /api/applications/student/:studentId` - Get student's applications

### Analytics Endpoints (Super Admin Only)
- `GET /api/analytics/overview` - Get overview statistics
- `GET /api/analytics/applications` - Get application analytics
- `GET /api/analytics/jobs` - Get job analytics
- `GET /api/analytics/users` - Get user analytics
- `GET /api/analytics/report` - Get comprehensive report

### User Management Endpoints (Admin)
- `GET /api/users` - Get all users
- `POST /api/users/invite` - Invite new user
- `PATCH /api/users/:id/status` - Toggle user status
- `DELETE /api/users/:id` - Delete user

---

## 🔒 Security Features

### Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Token Expiration**: Configurable token expiry
- **Account Status Check**: Deactivated users cannot login

### Authorization
- **Role-Based Access Control**: Different permissions for different roles
- **Route Protection**: Protected routes require authentication
- **Middleware Validation**: Request validation at middleware level

### Data Security
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Mongoose ORM protection
- **XSS Protection**: React's built-in XSS protection
- **CORS Configuration**: Controlled cross-origin requests

### File Upload Security
- **File Type Validation**: Only allowed file types
- **File Size Limits**: Maximum file size restrictions
- **Secure Storage**: Files stored in controlled directory

---

## 🚀 Future Enhancements

### Planned Features
- [ ] **Email Notifications**: Automated email alerts for applications and job postings
- [ ] **Advanced Filtering**: More sophisticated job-student matching algorithms
- [ ] **Resume Parser**: Automatic extraction of information from resumes
- [ ] **Interview Scheduling**: Automated interview slot booking system
- [ ] **Company Portal**: Dedicated interface for recruiters
- [ ] **Mobile App**: React Native mobile application
- [ ] **Real-time Chat**: Communication between students and admins
- [ ] **Document Management**: Centralized document storage and management
- [ ] **Performance Analytics**: Detailed student performance tracking
- [ ] **Integration APIs**: Third-party integrations (LinkedIn, job portals)

### Technical Improvements
- [ ] **Unit Testing**: Comprehensive test coverage
- [ ] **E2E Testing**: End-to-end testing with Cypress
- [ ] **CI/CD Pipeline**: Automated deployment
- [ ] **Docker Containerization**: Container-based deployment
- [ ] **Performance Optimization**: Caching and optimization
- [ ] **API Rate Limiting**: Prevent abuse
- [ ] **Logging System**: Comprehensive logging and monitoring

---

## 📞 Support and Contribution

### Getting Help
- **Documentation**: Check this file and README.md
- **Issues**: Report bugs via GitHub Issues
- **Email**: Contact project maintainers

### Contributing
We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Department of Computer Science, Gujarat University** - For the vision and support
- **Open Source Community** - For the amazing tools and libraries
- **Contributors** - For their valuable contributions

---

**Last Updated**: January 2025

**Version**: 1.0.0

---

*Built with ❤️ for better campus placements*

