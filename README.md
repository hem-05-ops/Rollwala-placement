# 🎓 Campus Placement Management System

A comprehensive, full-stack **College Placement Management System** designed to streamline and automate the entire campus recruitment process for educational institutions. Built with **React + Vite** and **Node.js + Express + MongoDB**, the portal bridges students, the placement cell, and recruiters with dedicated dashboards, job management, application tracking, analytics, and interview resources.

> **Vision:** Transforming spreadsheet chaos into streamlined success - A plug-and-play placement portal for every college.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features & Capabilities](#-features--capabilities)
3. [System Architecture](#️-system-architecture)
4. [Technology Stack](#️-technology-stack)
5. [User Roles and Permissions](#-user-roles-and-permissions)
6. [Core Modules & Functionality](#-core-modules--functionality)
7. [Database Models & Schemas](#️-database-models--schemas)
8. [Comprehensive API Documentation](#-comprehensive-api-documentation)
9. [Security Features](#-security-features)
10. [Detailed Project Structure](#-detailed-project-structure)
11. [Environment Configuration](#-environment-configuration)
12. [Installation & Getting Started](#-installation--getting-started)
13. [Available Scripts](#-available-scripts)
14. [Future Enhancements](#-future-enhancements)
15. [Contributing & Support](#-contributing--support)

---

## 🎯 Project Overview

This system addresses common challenges in educational placement drives by removing manual paperwork and disjointed communications. 

**Primary Goals Addressed:**
1. **Digitalize Placement Process**: Moving from localized Excel files and notice boards to a centralized database.
2. **Enhance Student Experience**: Offering a portal where students can manage profiles, take practice tests, learn from senior interviews, and track job applications in real-time.
3. **Streamline Admin Operations**: Empowering the placement cell with robust tools to publish jobs, filter out non-eligible candidates, and visually track applicant progress.
4. **Data-Driven Insights**: A comprehensive dashboard for super-admins detailing recruitment metrics and placement rates.

---

## ✨ Features & Capabilities

### Admin Control Center
- **Student Approvals**: Admins can approve or reject new student registrations. Integrated *Notification Badges* show the current count of pending approvals directly on the navigation menu.
- **Job Management**: Complete CRUD operations for job posts. Admins set eligibility criteria (CGPA, Course, Branch) meaning students only see jobs they actually qualify for.
- **Application Kanban Board**: Instead of typical tables, admins manage student lifecycle via a premium, drag-and-drop styled Kanban Board (Applied → Shortlisted → Selected/Rejected).
- **Placement Analytics (Super Admin)**: Beautiful charts detailing: Monthly Application Trends, Application Status Distributions, Top Performing Students, and Recruiter breakdown.
- **Practice Content Management**: Add, edit, and organize multiple-choice questions for various courses.
- **Interview Moderation**: Review and approve interview experiences shared by students before they become public.

### Student Portal
- **Smart Job Feed**: Shows only opportunities matching their specific academic profile.
- **Real-Time Tracking**: Students see real-time updates when an admin moves their application across the Kanban board.
- **Interactive Practice Quizzes**: Complete timed MCQs with post-quiz analytics mapping out their correct/incorrect responses for technical interview preparation.
- **Calendar View**: A visual agenda mapping out placement drives and upcoming company visits.
- **Profile Generation**: Students build comprehensive profiles including skills, GitHub/LinkedIn links, branch, and dynamically upload PDFs of their Resumes.

### Core Utilities
- **OTP Password Recovery**: Time-limited secure OTP emails sent directly to students.
- **Excel Exporting**: Admins can download application tables directly to `.xlsx` files.
- **Automated Emails**: Integrated Nodemailer alerting students when they are approved.

---

## 🏗️ System Architecture

The platform is designed around a decoupled RESTful **3-tier architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                   │
│              (React.js Frontend - Port 5173/5000)       │
│  - User Interface Components (Tailwind CSS, Lucide)     │
│  - State Management & Navigation (React Router DOM)     │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/REST API (Axios Interceptors)
┌──────────────────▼──────────────────────────────────────┐
│                  Application Layer                      │
│          (Node.js + Express.js - Port 3000)             │
│  - RESTful API Endpoints & Business Logic               │
│  - Authentication, Authorization & File Uploads         │
└──────────────────┬──────────────────────────────────────┘
                   │ MongoDB Driver (Mongoose)
┌──────────────────▼──────────────────────────────────────┐
│                    Data Layer                           │
│              (MongoDB Atlas - Cloud/Local)              │
│  - Users, Jobs, Applications, Analytics Data            │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Frontend** | React.js | 19.1.1 | Core UI Framework |
| **Frontend** | Vite | 6.3.5 | Build Tool & Dev Server |
| **Frontend** | React Router DOM | 7.6.2 | Client-Side Routing |
| **Frontend** | Tailwind CSS | 4.1.12 | Utility-First Styling |
| **Frontend** | Recharts | 3.1.2 | Data Visualizations & Analytics |
| **Frontend** | FullCalendar | 6.1.19 | Event Tracking |
| **Frontend** | Lucide React | 0.514.0 | Icon Library |
| **Backend** | Node.js | ≥18.x | JavaScript Runtime |
| **Backend** | Express.js | 5.1.0 | RESTful API Framework |
| **Backend** | Mongoose | 8.18.0 | MongoDB Object Modeling |
| **Backend** | JWT | 9.0.2 | Secure Authentication Tokens |
| **Backend** | Bcrypt | 6.0.0 | Password Hashing |
| **Backend** | Multer | 2.0.1 | Multipart File Upload Handling |
| **Backend** | Nodemailer | 7.0.5 | SMTP Email Transport |
| **Backend** | ExcelJS | 4.4.0 | Spreadsheet Generation |
| **Backend** | Zod | 4.0.17 | Payload Schema Validation |

---

## 👥 User Roles and Permissions

| Role | System Access Level | Key Capabilities | Restrictions |
|---|---|---|---|
| **Super Admin** | Full System Access | Analytics dashboard access, create/manage other admin accounts. Has all regular admin privileges. | None |
| **Admin** | Placement Management | Manage jobs, drag-and-drop application Kanban board, student approvals, practice questions, and interview moderation. | Cannot access Analytics. Cannot manage other admins. |
| **Student** | Personal Portal | Job application, track status, practice quizzes, profile management, and submit interview experiences. | Cannot view other students' data or post jobs. |

---

## 🧩 Core Modules & Functionality

### 1. Authentication & Security
- Complete JWT architecture mapping access tokens with refresh strategies.
- Passwords never stored in plain text, strictly bcrypt hashes with salt rounds.

### 2. File Processing
- Using Multer inside Express routes to parse `form-data`.
- Automatically filtering image uploads (Profile pictures) against PDFs (Resumes). Maximum file size limits heavily strictly enforced.

### 3. Practice Engine
- State-managed quiz UI rendering randomized question arrays.
- Score tabulation and submission against the `UserAttempt` schema preserving historical performance data per student.

### 4. Application Workflows
- Enforced deduplication (Students can only apply once to a given job).
- Status workflow: `Applied` ➡️ `Shortlisted` ➡️ (`Selected` | `Rejected`).

---

## 🗄️ Database Models & Schemas

The database schema utilizes `ObjectId` references to build relational mapping inside a NoSQL structure.

| Model | Schema Purpose | Notable Fields |
|---|---|---|
| `User` | Core auth document | `email`, `password` (hashed), `role`, `isActive` |
| `Student` | Student profile details | `userId` (ref User), `rollNo`, `course`, `branch`, `CGPA`, `skills` (Array), `resume` (URL), `isApproved` |
| `Job` | Corporate job listings | `companyName`, `role`, `type`, `location`, `description`, `eligibility` (Object), `isActive` |
| `Application`| Links Student & Job | `studentId` (ref Student), `jobId` (ref Job), `status` (Enum: Applied/Shortlisted/Selected/Rejected) |
| `InterviewExperience`| Peer-reviewed stories | `author`, `company`, `role`, `story`, `isApproved` |
| `Question` | Practice Quiz item | `course`, `questionText`, `options` (Array), `correctAnswer`, `explanation` |
| `UserAttempt` | Quiz historical data | `studentId` (ref Student), `course`, `score`, `answers` (Array) |
| `PasswordResetOtp`| OTP lifecycle handling | `email`, `otp` (hashed), `expiresAt` |

---

## 🔌 Comprehensive API Documentation

### Auth Module (`/api/auth`)
- `POST /register`: Registers a new user.
- `POST /login`: Authenticates user, returns JWT.
- `POST /forgot-password`: Generates & emails OTP.
- `POST /verify-otp`: Validates the generated OTP.
- `POST /reset-password`: Allows setting a new password.

### Student Module (`/api/students`)
- `GET /`: Lists all students (Admin).
- `GET /profile`: Gets currently logged-in student profile.
- `PUT /profile`: Updates student skills, academics, etc.

### Job Module (`/api/jobs`)
- `GET /`: Retrieve all active jobs (Filtered for students, all for Admin).
- `GET /:id`: Retrieves single job information.
- `POST /`: Admin only: create a new listing.
- `PUT /:id`: Admin only: updates job details.

### Application Module (`/api/applications`)
- `POST /`: Student applies for a job.
- `GET /`: Admin fetches all active applications (feeds Kanban).
- `PUT /:id`: Admin updates application status.
- `GET /student/:studentId`: Fetches history for one student.

### Practice Module (`/api/practice`)
- `GET /questions/:course`: Retrieves questions for practice test.
- `POST /submit`: Submits the quiz for grading and tracking.

### Analytics Module (`/api/analytics`) — Super Admin
- `GET /overview`: High-level aggregate numbers.
- `GET /report`: Generates the comprehensive breakdown.

*(For full endpoint mapping and parameters, consult the specific route files locally).*

---

## 🔒 Security Features

- **Authentication Protocol**: JWT Token passing with Bearer schema.
- **Payload Verification**: Zod enforces strict schema compliance on incoming requests (preventing injection & bad data mapping).
- **ORM Protections**: Mongoose handles NoSQL injection mitigation.
- **File Security**: Strict extension validation via Multer configurations.
- **Role Enforcement**: Custom `auth.js` middlewares guard REST endpoints mapping directly to the 3-tier user structure.

---

## 📁 Detailed Project Structure

```text
Rollwala-placement/
├── frontend/                    # Vite React Application
│   ├── public/                  # Raw assets
│   ├── src/
│   │   ├── api/                 # Axios interceptors and route mappers
│   │   ├── assets/              # App images
│   │   ├── components/          # Fragmented React UI Components
│   │   │   ├── AdminAnalytics.jsx
│   │   │   ├── AdminJobPosting.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── ... (Kanban UI, Navbars, Quiz UI)
│   │   ├── config/              # API connections
│   │   ├── lib/ & utils/        # Generic functions
│   │   ├── App.jsx              # Core React Router logic
│   │   ├── index.css            # Global CSS / Tailwind Injects
│   │   └── main.jsx             # React Virtual DOM entry
│   ├── package.json
│   └── vite.config.js           # Build settings
│
├── backend/                     # Express Node API Server
│   ├── config/                  # DB driver initialization
│   ├── controllers/             # Business Logic Layer
│   ├── middleware/              # JWT, Authentication & Multer Guards
│   ├── models/                  # Mongoose MongoDB Data Schemas
│   ├── routes/                  # Express Router Endpoints
│   ├── services/                # External Service connections (Nodemailer)
│   ├── scripts/                 # Independent run-scripts (Super Admin seeding)
│   ├── uploads/                 # Local directory for stored PDFs/JPEGs
│   ├── server.js                # Express Application Bootstrapper
│   └── package.json
│
├── PROJECT_INTRODUCTION.md      # Legacy Documentation
├── render.yaml                  # Advanced Deployment Configurations
└── README.md                    # This document
```

---

## 🔐 Environment Configuration

Create `.env` inside `backend/`:
```env
# Server Network Port
PORT=3000

# Database Configuration
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>

# Security Secrets
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Nodemailer Service Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

Create `.env` inside `frontend/`:
```env
VITE_API_URL=http://localhost:3000
```

---

## 🚀 Installation & Getting Started

**Prerequisites:** 
- Node.js (Version 18.0.0 or higher)
- MongoDB Database Instance (Atlas or Local via Compass)
- Git & Code Editor (VS Code recommended)

1. **Clone the Source Code:**
   ```bash
   git clone <repo-url>
   cd Rollwala-placement
   ```

2. **Initialize Backend Environment:**
   ```bash
   cd backend
   npm install
   ```

3. **Initialize Frontend Environment:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Variables:**
   Inject your specific secrets into the `.env` files created in the previous step. Ensure `VITE_API_URL` correctly targets your backend port.

5. **Generate Highest Authority User:**
   To access the Super Admin capabilities immediately:
   ```bash
   cd backend
   npm run create-super-admin
   ```

6. **Boot Local Development Servers (Dual Terminals required):**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm start # (or npm run dev if utilizing Nodemon)
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```
   **Access the Web Interface:** Open `http://localhost:5173` in your browser.

---

## 📜 Available Scripts

**Backend (`backend/`):**
- `npm start`: Initializes the main Express server instance.
- `npm run dev`: Identical to start for development mapping.
- `npm run create-super-admin`: Database seeding script for the primary admin.
- `npm run fix-database`: Orphaned document repair and mapping utility.

**Frontend (`frontend/`):**
- `npm run dev`: Initializes Vite Hot-Module Replacement server.
- `npm run build`: Compiles optimized React distribution bundle.
- `npm run preview`: Hosts the production build locally to test routing.

**Deployment Engine:**
This repository inherently supports [Render.com](https://render.com/) PaaS via the included `render.yaml` configuration matrix. The backend serves strictly as a web application mapping to the chosen `$PORT`, and frontend builds to Static Web standards.

---

## 🔮 Future Enhancements

The placement portal roadmap includes the following capabilities natively:
- [ ] **Resume Parsing Capabilities**: Automating the extraction of CGPA and skills directly from PDF uploads.
- [ ] **Automated Booking Scheduler**: Direct integration mapping recruiter availability to student calendars for interview scheduling.
- [ ] **Corporate Web Portal**: A dedicated 4th user tier allowing HR representatives direct access to job tracking.
- [ ] **Real-Time Websocket Chat**: Connecting placement coordinators directly to students via the portal matrix.
- [ ] **Integrated External APIs**: Direct "Apply with LinkedIn" parsing and syncing.

---

## 📞 Contributing & Support

If you encounter an issue or would like to submit a patch:
1. Identify the bug or enhancement via the Projects/Issues tab.
2. Fork the repository logic locally.
3. Commit targeted UI/API patches to your standard feature branch.
4. Execute via Pull Request for final review mapping.

*Documentation Last Updated: March 2026 | Built with ❤️ for the Department of Computer Science Placement Cell*
