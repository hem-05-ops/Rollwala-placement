# 🎓 Placement Portal — DCS (Department of Computer Science)

A full-stack **College Placement Management System** built with **React + Vite** on the frontend and **Node.js + Express + MongoDB** on the backend. The portal bridges students, the placement cell, and recruiters with dedicated dashboards, job management, application tracking, analytics, and interview resources.

---

## 📋 Table of Contents

- [Features Overview](#-features-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Modules & Functionality](#-modules--functionality)
  - [Public / Student-Facing](#-public--student-facing)
  - [Student Module](#-student-module)
  - [Admin Module](#-admin-module)
  - [Practice Module](#-practice-module)
  - [Analytics Module](#-analytics-module)
- [Database Models](#-database-models)
- [API Routes](#-api-routes)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Scripts](#-scripts)

---

## ✨ Features Overview

| Feature | Description |
|---|---|
| 🔐 Role-Based Auth | Separate login flows for Students and Admins (Super Admin + Admin) |
| 📋 Student Registration & Approval | Students register and await admin approval before login |
| 💼 Job Listings | Admin posts jobs; students browse, filter, and apply |
| 📄 Application Tracking | Students track their applications; admins manage them |
| 📚 Practice Module | Course-wise MCQ quizzes with results & attempt history |
| 📰 Interview Experiences | Students share and browse real interview stories |
| 📊 Analytics Dashboard | Visual charts on placements, applications, jobs, and students |
| 📅 Student Calendar | Track placement events and schedules |
| 📧 Email Notifications | Automated emails via Nodemailer for approvals, OTPs, etc. |
| 🔑 OTP-Based Password Reset | Secure password recovery with time-limited OTPs |
| 📁 File Uploads | Resume and profile picture uploads via Multer |
| 📤 Excel Export | Export application data as Excel sheets via ExcelJS |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| React Router DOM | Client-side routing |
| Recharts | Charts and data visualisations |
| Lucide React | Icon library |
| React Hot Toast | Toast notifications |
| Vanilla CSS | Styling (per-component CSS files) |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | Server and REST API |
| MongoDB + Mongoose 8 | Database and ODM |
| JSON Web Tokens (JWT) | Authentication and refresh tokens |
| bcrypt / bcryptjs | Password hashing |
| Nodemailer | Email delivery |
| Multer | File uploads (resumes, profile pictures) |
| ExcelJS | Excel report generation |
| Zod | Request schema validation |
| dotenv | Environment variable management |

---

## 📁 Project Structure

```
Rollwala-placement/
├── frontend/                    # React + Vite app
│   ├── src/
│   │   ├── App.jsx              # Root router & route definitions
│   │   ├── main.jsx             # App entry point
│   │   ├── index.css            # Global styles
│   │   ├── components/          # All page & UI components (45 files)
│   │   ├── api/                 # API helper functions
│   │   ├── config/              # Frontend config (e.g., VITE_API_URL)
│   │   ├── lib/                 # Utility libraries
│   │   └── utils/               # Helper utilities
│   └── vite.config.js
│
├── backend/                     # Node.js + Express API
│   ├── server.js                # Entry point, middleware, route mounting
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── models/                  # Mongoose schemas (11 models)
│   ├── routes/                  # Express route files (12 route groups)
│   ├── controllers/             # Business logic handlers
│   ├── middleware/              # Auth guards and other middleware
│   ├── services/
│   │   └── emailService.js      # Nodemailer email service
│   ├── scripts/
│   │   ├── createSuperAdmin.js  # Seed super-admin account
│   │   └── fixDatabase.js       # Database repair utilities
│   └── uploads/                 # Uploaded files (resumes, pics)
│
├── package.json                 # Root-level scripts
├── render.yaml                  # Render.com deployment config
└── README.md
```

---

## 🧩 Modules & Functionality

### 🌐 Public / Student-Facing

#### Home (`/`)
- Landing page with placement highlights, stats, and call-to-action.
- Newsletter subscription widget.

#### Jobs Page (`/jobs`)
- Publicly visible job listings posted by the admin.
- Filter by job type, location, and company.
- Students can apply directly from this page (requires login).

#### Interview Experience (`/interview-experience`)
- Community wall of student-submitted interview stories.
- Filter by company and role.
- Students can submit their own experiences.

#### About (`/about`)
- Department overview and placement cell information.

#### Contact (`/contact`)
- Contact form with direct email submission.

#### Sign In (`/signin`)
- General sign-in page (redirects based on role).

---

### 🎓 Student Module

#### Student Registration (`/student-register`)
- Multi-step registration form collecting:
  - Personal info (name, roll number, contact)
  - Academic details (course, branch, year, CGPA)
  - Profile extras (skills, projects, certifications, achievements)
  - Social links (LinkedIn, GitHub)
- Submits an approval request to the admin.

#### Student Login (`/student-login`)
- JWT-based login.
- Shows a "Pending Approval" message if the admin has not yet approved the account.
- OTP-based forgot password flow.

#### Student Dashboard (`/student-dashboard`)
- Personal dashboard showing:
  - Applied jobs and application statuses.
  - Shortlisted / selected notifications.
  - Quick links to profile, practice, and calendar.

#### Student Profile (`/profile`)
- View and edit full profile.
- Upload/update resume (PDF) and profile picture.
- Display skills, projects, certifications, and social links.

#### Student Calendar (`/student-dashboard` → Calendar tab)
- Visual calendar listing upcoming placement drives and interview dates.

---

### 🛡️ Admin Module

All admin routes are protected by `ProtectedRoute` (requires valid admin JWT).

#### Admin Login (`/admin-login`)
- Separate login for admins and super admins.
- JWT + refresh token flow.

#### Student Approvals (`/admin-students`) ⭐ Super Admin
- See all pending student registration requests.
- Approve or reject students.
- Approved students can then log in to the portal.

#### Admin Management (`/admin-management`)
- Manage admin accounts (Super Admin only).
- Create new admin users.
- View and deactivate existing admins.

#### Job Posting & Management (`/admin-job-posting`)
- **Post new jobs** with full details:
  - Company name, role, job type (Full-time, Internship, etc.)
  - Location, salary/stipend, eligibility criteria
  - Application deadline
- **Manage existing jobs**: edit, activate/deactivate, delete.
- View applications per job listing.

#### Application Management (`/application-management`)
- View all student applications across all job listings.
- Filter by status (Applied, Shortlisted, Selected, Rejected).
- Update application status individually or in bulk.
- Export application data as Excel report.

#### Interview Experience Management (`/admin-interview-experiences`)
- Review student-submitted interview stories.
- Approve or reject submissions before they go public.

#### Practice Question Management (`/admin-practice-questions`)
- Add, edit, and delete MCQ questions.
- Organise questions by course / topic.
- Set correct answers and multiple-choice options.

---

### 📚 Practice Module

#### Course List (`/practice-courses`)
- Lists all available practice courses (e.g., BSc.CS, MCA, MSc topics).
- Shows attempt history for the logged-in student.

#### Practice Quiz (`/practice/:courseId`)
- Timed MCQ quiz for the selected course.
- Single-attempt-per-session validation.

#### Result Page (`/practice/:courseId/result`)
- Displays score, correct answers, and per-question feedback after quiz submission.

---

### 📊 Analytics Module (`/admin-analytics`) — Super Admin Only

Full placement analytics dashboard with interactive charts:

| Chart | Description |
|---|---|
| Applications by Status | Pie chart — Applied / Shortlisted / Selected / Rejected |
| Applications by Month | Line chart — monthly application trends |
| Applications by Course | Bar chart — distribution across BSc.CS, MCA, etc. |
| Job Types Distribution | Pie chart — Full-time vs Internship vs Contract |
| Recruiting Companies | Bar chart — companies by application count |
| Students by Year | Bar chart — applicant distribution by academic year |
| Top Performing Students | Table with success rate, applications, and selections |
| Quick Stats Cards | Summary counts: companies, placed students, jobs, positions |

Data is exported in JSON format via the **Export Data** button.

---

## 🗄️ Database Models

| Model | Key Fields |
|---|---|
| `User` | email, password (hashed), role (admin/student/superadmin) |
| `Student` | user ref, rollNo, course, branch, year, CGPA, skills, projects, resume, isApproved |
| `Job` | company, role, type, location, salary, deadline, eligibility, isActive |
| `Application` | student ref, job ref, status (Applied/Shortlisted/Selected/Rejected) |
| `InterviewExperience` | author, company, role, story, isApproved |
| `Question` | course, questionText, options[], correctAnswer, explanation |
| `UserAttempt` | student ref, course, score, answers, attemptedAt |
| `Course` | name, description |
| `Faculty` | name, department, email |
| `Newsletter` | email, subscribedAt |
| `PasswordResetOtp` | email, otp (hashed), expiresAt |

---

## 🔌 API Routes

| Prefix | File | Description |
|---|---|---|
| `/api/students` | `studentRoutes.js` | Student CRUD, profile, approval status |
| `/api/auth` | `authRoutes.js` | Login, logout, token refresh, OTP reset |
| `/api/jobs` | `jobRoutes.js` | Job listings, create/edit/delete (admin) |
| `/api/applications` | `applicationRoutes.js` | Apply, list, update status, export |
| `/api/analytics` | `analyticsRoutes.js` | Overview, applications, jobs, users stats |
| `/api/practice` | `practiceRoutes.js` | Questions, quiz submission, attempt history |
| `/api/interview-experiences` | `interviewExperienceRoutes.js` | Submit, approve, list stories |
| `/api/admin` | `adminRoutes.js` | Admin login, token, super-admin actions |
| `/api/admin-management` | `adminManagementRoutes.js` | Admin user management |
| `/api/images` | `imageRoutes.js` | Image/file upload and retrieval |
| `/api/newsletter` | `newsletter.js` | Newsletter subscription |
| `/api` (user routes) | `userRoutes.js` | General user profile and settings |

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
# Server
PORT=3000

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_URL=http://localhost:3000
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18.0.0
- MongoDB Atlas account (or local MongoDB)
- npm

### 1. Clone the repository
```bash
git clone <repo-url>
cd Rollwala-placement
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

### 4. Configure environment variables
Set up both `.env` files as described in [Environment Variables](#-environment-variables).

### 5. Create a Super Admin account
```bash
cd backend
npm run create-super-admin
```

### 6. Start the backend server
```bash
cd backend
npm start
# Server runs on http://localhost:3000
```

### 7. Start the frontend dev server
```bash
cd frontend
npm run dev
# App runs on http://localhost:5000
```

---

## 📜 Scripts

### Backend (`backend/`)
| Command | Description |
|---|---|
| `npm start` | Start the production server |
| `npm run dev` | Start the server (same as start) |
| `npm run create-super-admin` | Seed the initial super-admin account |
| `npm run fix-database` | Run database repair utilities |

### Frontend (`frontend/`)
| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build the production bundle |
| `npm run preview` | Preview the production build locally |

---

## 👥 User Roles

| Role | Access |
|---|---|
| **Super Admin** | Full access — analytics, admin management, student approvals, all admin features |
| **Admin** | Job posting, application management, interview experience moderation, practice questions |
| **Student** | Dashboard, job applications, practice quiz, profile, calendar, interview experiences |

---

## 📦 Deployment

The project includes a `render.yaml` configuration for deployment on [Render.com](https://render.com). The backend serves on port `3000` and the frontend is built as a static application.

---

*Built with ❤️ for the Department of Computer Science Placement Cell*
