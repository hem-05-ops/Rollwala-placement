const express = require('express');
const router = express.Router();

const practiceController = require('../controllers/practiceController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Courses
router.get('/courses', practiceController.getCourses);
router.post('/courses', requireAuth, requireAdmin, practiceController.createCourse);

// Questions
router.get('/questions/:courseId', practiceController.getQuestionsByCourse);

// Convenience routes for specific practice types (student side)
router.get('/questions/:courseId/aptitude', (req, res, next) => {
  req.query.type = 'aptitude';
  return practiceController.getQuestionsByCourse(req, res, next);
});

router.get('/questions/:courseId/technical', (req, res, next) => {
  req.query.type = 'technical';
  return practiceController.getQuestionsByCourse(req, res, next);
});
router.post('/questions', requireAuth, requireAdmin, practiceController.createQuestion);
router.put('/questions/:id', requireAuth, requireAdmin, practiceController.updateQuestion);
router.delete('/questions/:id', requireAuth, requireAdmin, practiceController.deleteQuestion);

// Attempts
router.post('/attempts', requireAuth, practiceController.createAttempt);
router.get('/attempts/score/:courseId/:userId', requireAuth, practiceController.getUserScoreForCourse);

module.exports = router;
