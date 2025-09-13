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

// Create missing student profile
router.post('/create-profile', requireAuth, requireRole('student'), studentController.createStudentProfile);

module.exports = router; // Make sure this line exists
// Debug route to check user and student data (remove in production)
router.get('/debug/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const user = await User.findById(userId);
    const student = await Student.findOne({ user: userId });
    
    res.json({
      userExists: !!user,
      studentExists: !!student,
      user: user,
      student: student
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create missing student profile
router.post('/create-profile', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const { rollNo, course, branch, year, cgpa, contact } = req.body;
    
    // Check if student profile already exists
    const existingStudent = await Student.findOne({ user: req.user.id });
    if (existingStudent) {
      return res.status(409).json({ error: 'Student profile already exists' });
    }
    
    // Create new student profile
    const student = await Student.create({
      user: req.user.id,
      rollNo,
      course,
      branch,
      year,
      cgpa,
      contact
    });
    
    const populatedStudent = await Student.findById(student._id)
      .populate('user', 'name email role');
    
    res.status(201).json(populatedStudent);
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create missing student profile
router.post('/create-profile', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const { rollNo, course, branch, year, cgpa, contact } = req.body;
    
    // Check if student profile already exists
    const existingStudent = await Student.findOne({ user: req.user.id });
    if (existingStudent) {
      return res.status(409).json({ error: 'Student profile already exists' });
    }
    
    // Create new student profile
    const student = await Student.create({
      user: req.user.id,
      rollNo,
      course,
      branch,
      year,
      cgpa,
      contact
    });
    
    const populatedStudent = await Student.findById(student._id)
      .populate('user', 'name email role');
    
    res.status(201).json(populatedStudent);
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add this route before module.exports
router.post('/create-profile', requireAuth, requireRole('student'), studentController.createStudentProfile);
// Debug route to check if API is working
router.get('/debug-check', (req, res) => {
  res.json({ message: 'Student API is working', timestamp: new Date().toISOString() });
});

router.get('/test', (req, res) => {
  res.json({ message: 'Student API is working!', timestamp: new Date().toISOString() });
});
console.log('Student routes loaded'); // Add this line
// Test route directly in main server file

// Then mount your student routes
// app.use('/api/students', studentRoutes);
module.exports = router;