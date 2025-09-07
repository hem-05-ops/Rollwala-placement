const express = require('express');
const router = express.Router();
const { requireAuth, requireRole, requireAdmin } = require('../middleware/auth');
const interviewCtrl = require('../controllers/interviewExperienceController');

// Public routes
router.get('/approved', interviewCtrl.getAllApprovedExperiences);
router.get('/:id', interviewCtrl.getExperienceById);

// Student routes
router.post('/submit', requireAuth, requireRole('student'), interviewCtrl.submitInterviewExperience);

// Admin routes
router.get('/', requireAuth, requireAdmin, interviewCtrl.getAllExperiences);
router.put('/:id/status', requireAuth, requireAdmin, interviewCtrl.updateExperienceStatus);
router.delete('/:id', requireAuth, requireAdmin, interviewCtrl.deleteExperience);

// Legacy route for backward compatibility
router.post('/', interviewCtrl.addExperience);

module.exports = router;
