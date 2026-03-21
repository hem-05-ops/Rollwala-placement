const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const studentController = require('../controllers/studentController');

// Multer setup for resume uploads (PDF only)
const uploadsDir = path.join(__dirname, '..', 'uploads');
const resumesDir = path.join(uploadsDir, 'resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}

const resumeStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, resumesDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const resumeFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for resume uploads'), false);
  }
};

const uploadResume = multer({ storage: resumeStorage, fileFilter: resumeFileFilter });

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Student API test endpoint is working!', timestamp: new Date().toISOString() });
});

// Student registration
router.post('/register', studentController.registerStudent);

// Protected student routes
router.get('/profile', requireAuth, requireRole('student'), studentController.getStudentProfile);
router.put('/profile', requireAuth, requireRole('student'), studentController.updateStudentProfile);
router.post('/apply', requireAuth, requireRole('student'), studentController.applyForJob);
router.get('/applications', requireAuth, requireRole('student'), studentController.getStudentApplications);
router.get('/eligible-jobs', requireAuth, requireRole('student'), studentController.getEligibleJobs);
router.get('/calendar-events', requireAuth, requireRole('student'), studentController.getStudentCalendarEvents);

// Resume upload (PDF only)
router.post('/resume', requireAuth, requireRole('student'), uploadResume.single('resume'), studentController.uploadResume);

// Create missing student profile
router.post('/create-profile', requireAuth, requireRole('student'), studentController.createStudentProfile);

console.log('Student routes loaded');
module.exports = router;