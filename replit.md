# Overview

PMS-CGC-U (Placement Management System for Chandigarh Group of Colleges University) is a comprehensive web-based platform designed to modernize and automate campus placement processes. The system serves as a centralized hub for managing job postings, student applications, interview experiences, and administrative tasks. Built with the MERN stack, it provides role-based access for students, faculty, and administrators, replacing traditional spreadsheet-based workflows with a streamlined digital solution.

The platform features both off-campus job listings with external application links and on-campus opportunities with custom application forms. It includes advanced features like dynamic form builders, application tracking, interview experience sharing, newsletter subscriptions, and comprehensive analytics dashboards for placement insights.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with Vite as the build tool
- **Routing**: React Router DOM for client-side navigation
- **Styling**: Tailwind CSS 4.x with custom CSS modules for component-specific styles
- **State Management**: Local component state and Context API patterns
- **UI Components**: Custom components with Framer Motion for animations
- **Icons**: Lucide React and React Icons libraries
- **Notifications**: React Hot Toast and React Toastify for user feedback
- **Charts**: Recharts for analytics and data visualization

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM for data modeling
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **File Upload**: Multer middleware for handling multipart/form-data
- **Validation**: Zod library for runtime type validation and schema parsing
- **Email Service**: Nodemailer for transactional emails and newsletter functionality
- **CORS**: Configured for cross-origin requests between frontend and backend

## Database Design
- **User Model**: Hierarchical role system (student, faculty, admin, super_admin)
- **Student Model**: Extended profile with academic details, skills, projects, and certifications
- **Job Model**: Supports both off-campus and on-campus job types with dynamic form fields
- **Application Model**: Flexible form response storage with status tracking
- **Interview Experience Model**: Community-driven interview insights with approval workflow
- **Newsletter Model**: Email subscription management with unsubscribe tokens

## Authentication & Authorization
- **Multi-role System**: Role-based access control with middleware guards
- **Token Management**: Separate token storage for admin and student sessions
- **Password Security**: Bcrypt hashing with salt rounds and force password change capability
- **Admin Hierarchy**: Super admin can create and manage regular admins
- **Session Management**: JWT tokens with configurable expiration times

## File Management
- **Local Storage**: Multer-based file uploads to local uploads directory
- **Image Processing**: Support for company logos, resumes, and profile pictures
- **Static Serving**: Express static middleware for serving uploaded files
- **File Validation**: MIME type and file size restrictions for security

# External Dependencies

## Database Services
- **MongoDB Atlas**: Cloud-hosted MongoDB database for data persistence
- **Mongoose**: Object Document Mapper for MongoDB with schema validation

## Email Services
- **Nodemailer**: SMTP-based email service for confirmations and newsletters
- **Email Templates**: HTML email templates for subscription confirmations

## Authentication
- **JWT (jsonwebtoken)**: Token-based authentication system
- **bcrypt**: Password hashing and verification library

## File Upload & Storage
- **Multer**: Multipart form data handling for file uploads
- **Local File System**: Server-side file storage in uploads directory

## Frontend Libraries
- **Axios**: HTTP client for API communication
- **Framer Motion**: Animation library for smooth UI transitions
- **Recharts**: Data visualization library for analytics dashboards
- **React Hot Toast**: Lightweight notification system

## Development Tools
- **Vite**: Fast build tool and development server
- **ESLint**: Code linting with React-specific rules
- **Tailwind CSS**: Utility-first CSS framework
- **dotenv**: Environment variable management

## API Integration
- **RESTful APIs**: Express-based REST endpoints for all CRUD operations
- **CORS**: Cross-Origin Resource Sharing configuration for frontend-backend communication
- **Request Interceptors**: Axios interceptors for automatic token attachment