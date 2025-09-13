const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const studentController = require('../controllers/studentController');

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

// Create missing student profile
router.post('/create-profile', requireAuth, requireRole('student'), studentController.createStudentProfile);

console.log('Student routes loaded');
module.exports = router;